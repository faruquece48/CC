"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

type Verification = { valid: boolean; message?: string; certificate?: { type: string; registrationId: number; name: string; event: string } };

export default function ParticipationCertificateVerificationPage() {
  const token = useSearchParams().get("token") || "";
  const [result, setResult] = useState<Verification | null>(null);
  useEffect(() => {
    if (!token) { setResult({ valid: false, message: "No certificate verification code was provided." }); return; }
    fetch(`/api/participation-certificate-verify?token=${encodeURIComponent(token)}`, { cache: "no-store" })
      .then(async response => response.json()).then(setResult)
      .catch(() => setResult({ valid: false, message: "Certificate verification is temporarily unavailable." }));
  }, [token]);
  return <main className="min-h-screen bg-[#f5f0e5] px-4 py-12"><section className="mx-auto max-w-xl overflow-hidden rounded-3xl border border-[#d5ad5f] bg-[#fffdf7] shadow-xl">
    <header className="bg-[#0b2e3d] px-7 py-8 text-center text-white"><ShieldCheck className="mx-auto mb-3 text-amber-300" size={42}/><p className="text-xs font-bold uppercase tracking-[.3em] text-amber-300">Construct Carnival 2.0</p><h1 className="mt-2 text-2xl font-black">Certificate Verification</h1></header>
    <div className="p-7">{!result ? <div className="flex items-center justify-center gap-3 py-12 text-slate-600"><Loader2 className="animate-spin"/> Verifying certificate...</div>
      : result.valid && result.certificate ? <div><div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-800"><CheckCircle2 size={28}/><div><p className="font-black">Authentic certificate</p><p className="text-sm">Verified against the official participant record.</p></div></div>
      <dl className="mt-6 space-y-4 text-sm"><div><dt className="font-bold uppercase tracking-wide text-slate-500">Recipient</dt><dd className="mt-1 text-lg font-black text-[#085041]">{result.certificate.name}</dd></div><div><dt className="font-bold uppercase tracking-wide text-slate-500">Certificate</dt><dd className="mt-1 font-semibold">{result.certificate.type}</dd></div><div><dt className="font-bold uppercase tracking-wide text-slate-500">Registration ID</dt><dd className="mt-1 font-semibold">{result.certificate.registrationId}</dd></div><div><dt className="font-bold uppercase tracking-wide text-slate-500">Event</dt><dd className="mt-1 font-semibold">{result.certificate.event}</dd></div></dl></div>
      : <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-red-800"><XCircle className="shrink-0" size={28}/><div><p className="font-black">Certificate not verified</p><p className="mt-1 text-sm">{result.message}</p></div></div>}</div>
  </section></main>;
}
