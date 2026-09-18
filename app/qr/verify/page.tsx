"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Verification = {
  valid: boolean;
  message?: string;
  purpose?: "kit" | "lunch";
  registrationId?: number;
};

export default function QrVerificationPage() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<Verification | null>(null);
  useEffect(() => {
    const token = searchParams.get("token") || "";
    fetch(`/api/participant-qr/verify?token=${encodeURIComponent(token)}`, { cache: "no-store" })
      .then(async (response) => ({ response, data: await response.json().catch(() => null) }))
      .then(({ response, data }) => setResult(data || { valid: false, message: `Verification failed (HTTP ${response.status}).` }))
      .catch(() => setResult({ valid: false, message: "Unable to verify this QR code." }));
  }, [searchParams]);

  return <main className="grid min-h-screen place-items-center bg-slate-100 p-5">
    <section className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl">
      {!result ? <><Loader2 className="mx-auto animate-spin text-emerald-700" size={44} /><h1 className="mt-4 text-xl font-bold">Verifying QR code…</h1></> : result.valid ? <>
        <CheckCircle2 className="mx-auto text-emerald-600" size={56} />
        <p className="mt-4 text-sm font-extrabold uppercase tracking-[0.2em] text-emerald-700">Valid {result.purpose} code</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">{result.purpose === "kit" ? "Kit Collection" : "Lunch Collection"}</h1>
        <p className="mt-6 rounded-2xl bg-emerald-50 p-5 text-xl font-bold">Registration ID: {result.registrationId}</p>
      </> : <>
        <XCircle className="mx-auto text-red-600" size={56} />
        <h1 className="mt-4 text-3xl font-extrabold text-red-800">Invalid QR Code</h1>
        <p className="mt-3 text-slate-600">{result.message}</p>
      </>}
    </section>
  </main>;
}