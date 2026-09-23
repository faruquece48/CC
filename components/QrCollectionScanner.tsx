"use client";

import { Camera, CheckCircle2, Loader2, PackageCheck, RefreshCw, ScanLine, Soup, XCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Purpose = "kit" | "lunch";
type ScanResult = { success: boolean; message: string; registrationId?: number | string; participantName?: string };
type BarcodeDetectorInstance = { detect(source: HTMLVideoElement): Promise<Array<{ rawValue: string }>> };
type BarcodeDetectorConstructor = new (options: { formats: string[] }) => BarcodeDetectorInstance;

function extractToken(value: string) {
  const trimmed = value.trim();
  try { return new URL(trimmed).searchParams.get("token") || ""; } catch { return trimmed.includes(".") ? trimmed : ""; }
}

export default function QrCollectionScanner({ purpose }: { purpose: Purpose }) {
  const isKit = purpose === "kit";
  const [count, setCount] = useState(0);
  const [scannedIds, setScannedIds] = useState<Array<number | string>>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [awaitingNext, setAwaitingNext] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [status, setStatus] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<BarcodeDetectorInstance | null>(null);
  const scanningRef = useRef(false);
  const cameraStartingRef = useRef(false);
  const processingRef = useRef(false);
  const awaitingNextRef = useRef(false);

  const applySummary = useCallback((data: any) => {
    if (data?.counts) setCount(Number(data.counts[purpose] || 0));
    if (data?.scanned) setScannedIds(Array.isArray(data.scanned[purpose]) ? data.scanned[purpose] : []);
  }, [purpose]);

  const loadStats = useCallback(async () => {
    try {
      const response = await fetch("/api/qrcheck", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "stats" }) });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || "Unable to load totals.");
      applySummary(data);
      setStatus("");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Unable to load totals."); }
  }, [applySummary]);

  useEffect(() => { loadStats(); }, [loadStats]);

  const redeem = useCallback(async (rawValue: string) => {
    if (processingRef.current || awaitingNextRef.current) return;
    const token = extractToken(rawValue);
    processingRef.current = true;
    setProcessing(true);
    setResult(null);
    try {
      if (!token) throw new Error("This is not a valid Construct Carnival collection QR code.");
      const response = await fetch("/api/qrcheck", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "redeem", purpose, token }),
      });
      const data = await response.json().catch(() => null);
      applySummary(data);
      setResult({ success: response.ok, message: data?.message || `QR check failed (HTTP ${response.status}).`, registrationId: data?.registrationId, participantName: data?.participantName });
      if ("vibrate" in navigator) navigator.vibrate(response.ok ? 120 : [100, 80, 100]);
    } catch (error) {
      setResult({ success: false, message: error instanceof Error ? error.message : "Unable to check this QR code." });
    } finally {
      setProcessing(false);
      processingRef.current = false;
      awaitingNextRef.current = true;
      setAwaitingNext(true);
    }
  }, [applySummary, purpose]);

  const stopCamera = useCallback(() => {
    scanningRef.current = false;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  const startCamera = async () => {
    if (cameraStartingRef.current || streamRef.current) return;
    cameraStartingRef.current = true;
    setCameraStarting(true);
    setResult(null);
    setStatus("");
    const Detector = (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
    if (!Detector) {
      setStatus("Camera QR scanning is not supported by this browser. Use Chrome on Android.");
      cameraStartingRef.current = false;
      setCameraStarting(false);
      return;
    }
    try {
      detectorRef.current = new Detector({ formats: ["qr_code"] });
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (error) {
          if (!(error instanceof DOMException) || error.name !== "AbortError") throw error;
          await new Promise((resolve) => window.setTimeout(resolve, 150));
          if (videoRef.current?.paused) await videoRef.current.play();
        }
      }
      setCameraActive(true);
      cameraStartingRef.current = false;
      setCameraStarting(false);
      scanningRef.current = true;
      const scan = async () => {
        if (!scanningRef.current) return;
        if (!processingRef.current && !awaitingNextRef.current && videoRef.current?.readyState && videoRef.current.readyState >= 2 && detectorRef.current) {
          try {
            const codes = await detectorRef.current.detect(videoRef.current);
            if (codes[0]?.rawValue) await redeem(codes[0].rawValue);
          } catch { /* continue scanning */ }
        }
        if (scanningRef.current) window.setTimeout(scan, 140);
      };
      scan();
    } catch (error) {
      cameraStartingRef.current = false;
      setCameraStarting(false);
      setStatus(error instanceof Error ? `Unable to start camera: ${error.message}` : "Unable to start camera.");
      stopCamera();
    }
  };

  const nextScan = () => {
    setResult(null);
    awaitingNextRef.current = false;
    setAwaitingNext(false);
  };

  useEffect(() => () => stopCamera(), [stopCamera]);
  const recentScannedIds = scannedIds.slice(0, 10);
  const allScannedIds = [...scannedIds].sort((left, right) => String(left).localeCompare(String(right), undefined, { numeric: true }));
  const Icon = isKit ? PackageCheck : Soup;

  return <main className="min-h-screen bg-white px-4 py-6 text-slate-800">
    <section className="mx-auto max-w-xl">
      <div className="text-center"><Icon className={isKit ? "mx-auto text-emerald-600" : "mx-auto text-amber-600"} size={42} /><p className={isKit ? "mt-3 text-xs font-extrabold uppercase tracking-[.25em] text-emerald-700" : "mt-3 text-xs font-extrabold uppercase tracking-[.25em] text-amber-700"}>One-time collection scanner</p><h1 className="mt-2 text-3xl font-extrabold">{isKit ? "Kit Collection" : "Lunch Collection"}</h1><p className="mt-2 text-sm text-slate-600">Each valid participant code can be accepted only once on this page.</p></div>

      <div className={`mt-5 rounded-2xl border p-5 text-center ${isKit ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}><p className="text-sm font-bold uppercase tracking-wider text-slate-600">Total scanned</p><p className={`mt-1 text-5xl font-black ${isKit ? "text-emerald-700" : "text-amber-700"}`}>{count}</p></div>

      <div className="relative mx-auto mt-5 aspect-square w-full max-w-sm overflow-hidden rounded-3xl border border-slate-300 bg-black">
        <video ref={videoRef} playsInline muted className="h-full w-full object-cover object-center" />
        {!cameraActive && <div className="absolute inset-0 grid place-items-center text-center"><div><Camera className="mx-auto text-slate-500" size={52} /><p className="mt-3 text-sm text-slate-400">Camera is off</p></div></div>}
        {cameraActive && !awaitingNext && <div className={`pointer-events-none absolute inset-[16%] rounded-3xl border-2 ${isKit ? "border-emerald-400" : "border-amber-400"} shadow-[0_0_0_999px_rgba(0,0,0,.35)]`}><ScanLine className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${isKit ? "text-emerald-300" : "text-amber-300"}`} size={42} /></div>}
        {processing && <div className="absolute inset-0 grid place-items-center bg-black/65"><Loader2 className="animate-spin text-white" size={48} /></div>}
      </div>
      <div className="mx-auto mt-4 grid w-full max-w-sm grid-cols-2 gap-3"><button type="button" onClick={startCamera} disabled={cameraActive || cameraStarting} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-white disabled:opacity-40 ${isKit ? "bg-emerald-600" : "bg-amber-600"}`}>{cameraStarting ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />} {cameraStarting ? "Starting..." : "Start camera"}</button><button type="button" onClick={stopCamera} disabled={!cameraActive} className="rounded-xl bg-slate-600 px-4 py-3 font-bold text-white disabled:opacity-40">Stop camera</button></div>

      {result && <div className={`mt-5 rounded-2xl border p-5 text-center ${result.success ? "border-emerald-400 bg-emerald-50" : "border-red-400 bg-red-50"}`}>{result.success ? <CheckCircle2 className="mx-auto text-emerald-600" size={48} /> : <XCircle className="mx-auto text-red-600" size={48} />}<h2 className="mt-2 text-xl font-extrabold">{result.message}</h2>{result.registrationId && <p className="mt-2">Registration ID: <strong>{result.registrationId}</strong></p>}{result.participantName && <p className="mt-1 text-sm text-slate-700">{result.participantName}</p>}<button type="button" onClick={nextScan} className={`mt-5 w-full rounded-xl px-5 py-3 text-lg font-extrabold text-white ${isKit ? "bg-emerald-600" : "bg-amber-600"}`}>Next scan</button></div>}

      <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between"><h2 className="font-extrabold">Scanned registration numbers</h2><button type="button" onClick={loadStats} className="inline-flex items-center gap-1 text-xs font-bold text-slate-600"><RefreshCw size={14} /> Refresh</button></div>
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-600">Last 10 scans</h3>
          {recentScannedIds.length ? <div className="mt-3 flex flex-nowrap gap-2 overflow-x-auto pb-1">{recentScannedIds.map((id, index) => <span key={`recent-${id}-${index}`} className={`shrink-0 rounded-lg px-3 py-2 text-sm font-bold ${isKit ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>{id}</span>)}</div> : <p className="mt-3 text-sm text-slate-500">No registrations scanned yet.</p>}
        </div>
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-600">All IDs in serial order</h3><span className="text-xs font-bold text-slate-500">{allScannedIds.length} total</span></div>
          {allScannedIds.length ? <div className="mt-3 flex max-h-64 flex-wrap gap-2 overflow-y-auto">{allScannedIds.map((id, index) => <span key={`all-${id}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold">{id}</span>)}</div> : <p className="mt-3 text-sm text-slate-500">No registrations scanned yet.</p>}
        </div>
      </section>
      {status && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{status}</p>}
    </section>
  </main>;
}