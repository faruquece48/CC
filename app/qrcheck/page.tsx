"use client";

import { Camera, CheckCircle2, Loader2, PackageCheck, RefreshCw, ScanLine, Soup, XCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Purpose = "kit" | "lunch";
type ScanResult = { success: boolean; message: string; registrationId?: number; participantName?: string; code?: string };
type BarcodeDetectorInstance = { detect(source: HTMLVideoElement): Promise<Array<{ rawValue: string }>> };
type BarcodeDetectorConstructor = new (options: { formats: string[] }) => BarcodeDetectorInstance;

function extractToken(value: string) {
  const trimmed = value.trim();
  try { return new URL(trimmed).searchParams.get("token") || ""; } catch { return trimmed.includes(".") ? trimmed : ""; }
}

export default function QrCheckPage() {
  const [purpose, setPurpose] = useState<Purpose>("kit");
  const [counts, setCounts] = useState({ kit: 0, lunch: 0 });
  const [cameraActive, setCameraActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [manualValue, setManualValue] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [status, setStatus] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<BarcodeDetectorInstance | null>(null);
  const scanningRef = useRef(false);
  const processingRef = useRef(false);

  const loadStats = useCallback(async () => {
    try {
      const response = await fetch("/api/qrcheck", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "stats" }) });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || "Unable to load totals.");
      setCounts(data.counts);
      setStatus("");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Unable to load totals."); }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const redeem = useCallback(async (rawValue: string) => {
    if (processingRef.current) return;
    const token = extractToken(rawValue);
    if (!token) { setResult({ success: false, message: "This QR code does not contain a valid collection token." }); return; }
    processingRef.current = true;
    setProcessing(true);
    setResult(null);
    try {
      const response = await fetch("/api/qrcheck", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "redeem", purpose, token }),
      });
      const data = await response.json().catch(() => null);
      if (data?.counts) setCounts(data.counts);
      setResult({ success: response.ok, message: data?.message || `QR check failed (HTTP ${response.status}).`, registrationId: data?.registrationId, participantName: data?.participantName, code: data?.code });
      if (response.ok && "vibrate" in navigator) navigator.vibrate(120);
      if (!response.ok && "vibrate" in navigator) navigator.vibrate([100, 80, 100]);
    } catch { setResult({ success: false, message: "Unable to check this QR code. Check the connection and retry." }); }
    finally {
      setProcessing(false);
      setTimeout(() => { processingRef.current = false; }, 1400);
    }
  }, [purpose]);

  const stopCamera = useCallback(() => {
    scanningRef.current = false;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  const startCamera = async () => {
    setResult(null);
    setStatus("");
    const Detector = (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
    if (!Detector) { setStatus("QR camera scanning is not supported by this browser. Use Chrome on Android or paste the scanned QR value below."); return; }
    try {
      detectorRef.current = new Detector({ formats: ["qr_code"] });
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setCameraActive(true);
      scanningRef.current = true;
      const scan = async () => {
        if (!scanningRef.current) return;
        if (!processingRef.current && videoRef.current && videoRef.current.readyState >= 2 && detectorRef.current) {
          try {
            const codes = await detectorRef.current.detect(videoRef.current);
            if (codes[0]?.rawValue) await redeem(codes[0].rawValue);
          } catch { /* keep scanning */ }
        }
        if (scanningRef.current) window.setTimeout(scan, 140);
      };
      scan();
    } catch (error) { setStatus(error instanceof Error ? `Unable to start camera: ${error.message}` : "Unable to start camera."); stopCamera(); }
  };

  useEffect(() => () => stopCamera(), [stopCamera]);
  useEffect(() => { setResult(null); }, [purpose]);

  return <main className="min-h-screen bg-white px-4 py-6 text-slate-800">
    <section className="mx-auto max-w-xl">
      <div className="text-center"><p className="text-xs font-extrabold uppercase tracking-[.25em] text-emerald-700">One-time collection scanner</p><h1 className="mt-2 text-3xl font-extrabold">QR Check</h1><p className="mt-2 text-sm text-slate-600">Select the counter before scanning. A valid code can be accepted only once per collection type.</p></div>


      <div className="mt-5 grid grid-cols-2 gap-3">
        <button type="button" onClick={() => setPurpose("kit")} className={`rounded-2xl border p-4 text-left ${purpose === "kit" ? "border-emerald-400 bg-emerald-500/20" : "border-slate-200 bg-white shadow-sm"}`}><PackageCheck size={24} /><span className="mt-2 block font-extrabold">Kit Collection</span><span className="text-3xl font-black text-emerald-700">{counts.kit}</span><span className="ml-2 text-xs text-slate-500">scanned</span></button>
        <button type="button" onClick={() => setPurpose("lunch")} className={`rounded-2xl border p-4 text-left ${purpose === "lunch" ? "border-amber-400 bg-amber-500/20" : "border-slate-200 bg-white shadow-sm"}`}><Soup size={24} /><span className="mt-2 block font-extrabold">Lunch Collection</span><span className="text-3xl font-black text-amber-700">{counts.lunch}</span><span className="ml-2 text-xs text-slate-500">scanned</span></button>
      </div>

      <div className="relative mt-5 aspect-[3/4] max-h-[62vh] overflow-hidden rounded-3xl border border-slate-300 bg-black">
        <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
        {!cameraActive && <div className="absolute inset-0 grid place-items-center text-center"><div><Camera className="mx-auto text-slate-500" size={52} /><p className="mt-3 text-sm text-slate-500">Camera is off</p></div></div>}
        {cameraActive && <div className="pointer-events-none absolute inset-[16%] rounded-3xl border-2 border-emerald-400 shadow-[0_0_0_999px_rgba(0,0,0,.35)]"><ScanLine className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-300" size={42} /></div>}
        {processing && <div className="absolute inset-0 grid place-items-center bg-black/65"><Loader2 className="animate-spin text-emerald-300" size={48} /></div>}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3"><button type="button" onClick={startCamera} disabled={cameraActive} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white disabled:opacity-40"><Camera size={18} /> Start camera</button><button type="button" onClick={stopCamera} disabled={!cameraActive} className="rounded-xl bg-slate-600 px-4 py-3 font-bold text-white disabled:opacity-40">Stop camera</button></div>

      {result && <div className={`mt-5 rounded-2xl border p-5 text-center ${result.success ? "border-emerald-400 bg-emerald-500/20" : "border-red-400 bg-red-500/20"}`}>{result.success ? <CheckCircle2 className="mx-auto text-emerald-600" size={48} /> : <XCircle className="mx-auto text-red-600" size={48} />}<h2 className="mt-2 text-xl font-extrabold">{result.message}</h2>{result.registrationId && <p className="mt-2">Registration ID: <strong>{result.registrationId}</strong></p>}{result.participantName && <p className="mt-1 text-sm text-slate-700">{result.participantName}</p>}</div>}

      <details className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm p-4"><summary className="cursor-pointer font-bold">Manual fallback</summary><p className="mt-2 text-xs text-slate-500">Paste a QR URL or signed token when camera scanning is unavailable.</p><textarea value={manualValue} onChange={(event) => setManualValue(event.target.value)} rows={3} className="mt-3 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs outline-none" /><button type="button" onClick={() => redeem(manualValue)} disabled={!manualValue.trim() || processing} className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white disabled:opacity-40">Check code</button></details>
      <button type="button" onClick={loadStats} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold"><RefreshCw size={16} /> Refresh totals</button>
      {status && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{status}</p>}
    </section>
  </main>;
}