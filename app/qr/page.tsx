"use client";

import { Database, Download, Loader2, Mail, QrCode, Search, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { formatParticipantName } from "@/lib/participantName";

type Participant = {
  registration_id: number;
  name: string;
  email: string;
  normalized_email: string;
};

type QrPreview = { kitQr: string; lunchQr: string };

export default function ParticipantQrPage() {
  const [adminPassword, setAdminPassword] = useState(process.env.NODE_ENV === "development" ? "local-development" : "");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [preview, setPreview] = useState<QrPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  const selectedParticipant = participants.find((participant) => Number(participant.registration_id) === selectedId);
  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return participants.filter((participant) =>
      String(participant.registration_id).includes(query)
      || participant.name.toLowerCase().includes(query)
      || participant.email.toLowerCase().includes(query)).slice(0, 30);
  }, [participants, search]);

  const loadParticipants = async () => {
    setLoading(true);
    setStatus("");
    try {
      const response = await fetch("/api/participant-qr", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword, action: "list" }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.message || "Unable to load participants.");
      const loaded = (result.participants || []).map((participant: Participant) => ({ ...participant, name: formatParticipantName(participant.name) }));
      setParticipants(loaded);
      setStatus(`${loaded.length} unique paid participants loaded.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to load participants.");
    } finally { setLoading(false); }
  };

  const selectParticipant = async (participant: Participant) => {
    setSelectedId(Number(participant.registration_id));
    setGenerating(true);
    setPreview(null);
    setStatus(`Generating QR codes for registration ${participant.registration_id}…`);
    try {
      const response = await fetch("/api/participant-qr", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword, action: "generate", registrationId: participant.registration_id, email: participant.normalized_email }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.message || "Unable to generate QR codes.");
      setPreview({ kitQr: result.kitQr, lunchQr: result.lunchQr });
      setStatus(`QR codes generated for registration ${participant.registration_id}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to generate QR codes.");
    } finally { setGenerating(false); }
  };

  const sendToParticipants = async (recipients: Participant[]) => {
    if (!recipients.length || sending) return;
    if (!window.confirm(`Email separate kit and lunch QR codes to ${recipients.length} participant(s)?`)) return;
    setSending(true);
    let sent = 0;
    let failed = 0;
    const errors = new Set<string>();
    for (let index = 0; index < recipients.length; index += 1) {
      const participant = recipients[index];
      setStatus(`Sending ${index + 1} of ${recipients.length}…`);
      try {
        const response = await fetch("/api/participant-qr", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: adminPassword, action: "send", registrationId: participant.registration_id, email: participant.normalized_email }),
        });
        const result = await response.json().catch(() => null);
        if (!response.ok) throw new Error(result?.message || `Unable to send registration ${participant.registration_id}.`);
        sent += 1;
      } catch (error) {
        failed += 1;
        errors.add(error instanceof Error ? error.message : "Unknown delivery error.");
      }
    }
    setStatus(`${sent} sent, ${failed} failed.${errors.size ? ` ${Array.from(errors).join(" ")}` : ""}`);
    setSending(false);
  };

  return <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-800 sm:px-6">
    <section className="mx-auto max-w-5xl rounded-3xl border border-emerald-200 bg-white p-6 shadow-xl sm:p-8">
      <div className="flex items-start gap-4"><div className="rounded-2xl bg-[#073f37] p-3 text-amber-300"><QrCode size={28} /></div><div><p className="text-xs font-extrabold uppercase tracking-[.22em] text-emerald-700">All unique paid participants</p><h1 className="mt-1 text-3xl font-extrabold text-[#073f37]">Kit & Lunch QR Codes</h1><p className="mt-2 text-sm text-slate-600">Generate and email a distinct signed code for each collection purpose.</p></div></div>
      <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900"><strong>Participant notice:</strong> Do not share or forward QR codes. Each kit and lunch code is personal and can be accepted only once.</div>
      <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_auto]"><input type="password" value={adminPassword} onChange={(event) => setAdminPassword(event.target.value)} placeholder="Admin password" className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600" /><button type="button" onClick={loadParticipants} disabled={!adminPassword || loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#073f37] px-5 py-3 font-bold text-white disabled:opacity-50">{loading ? <Loader2 className="animate-spin" size={18} /> : <Database size={18} />} Load participants</button></div>

      {participants.length > 0 && <>
        <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-4">
          <label className="flex items-center gap-2 text-sm font-bold text-sky-900"><Search size={17} /> Search by registration ID, name, or email</label>
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Enter registration ID…" className="mt-2 w-full rounded-xl border border-sky-200 bg-white px-4 py-3 outline-none focus:border-sky-600" />
          {search.trim() && <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-sky-200 bg-white">{searchResults.length ? searchResults.map((participant) => <button key={`${participant.registration_id}-${participant.normalized_email}`} type="button" onClick={() => selectParticipant(participant)} className={`flex w-full items-center gap-3 border-b border-sky-100 px-4 py-3 text-left last:border-0 ${selectedId === Number(participant.registration_id) ? "bg-sky-100" : ""}`}><span className="rounded bg-slate-100 px-2 py-1 text-xs font-bold">ID {participant.registration_id}</span><span className="min-w-0"><span className="block font-bold">{participant.name}</span><span className="block truncate text-xs text-slate-500">{participant.email}</span></span></button>) : <p className="p-4 text-sm text-slate-500">No paid participant found.</p>}</div>}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => sendToParticipants(participants)} disabled={sending} className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-3 font-bold text-white disabled:opacity-50">{sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Email all {participants.length}</button>
          <button type="button" onClick={() => selectedParticipant && sendToParticipants([selectedParticipant])} disabled={!selectedParticipant || sending} className="inline-flex items-center gap-2 rounded-xl bg-sky-700 px-5 py-3 font-bold text-white disabled:opacity-50"><Mail size={18} /> Email selected participant</button>
        </div>
      </>}

      {generating && <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-slate-50 p-8 font-bold text-emerald-800"><Loader2 className="animate-spin" /> Generating QR codes…</div>}
      {preview && selectedParticipant && <div className="mt-7"><h2 className="text-xl font-extrabold text-[#073f37]">Registration {selectedParticipant.registration_id} — {selectedParticipant.name}</h2><div className="mt-4 grid gap-5 sm:grid-cols-2">{([['kitQr', 'Kit Collection'], ['lunchQr', 'Lunch Collection']] as const).map(([key, label]) => <article key={key} className="rounded-2xl border border-slate-200 p-5 text-center"><h3 className="text-lg font-extrabold">{label}</h3><img src={preview[key]} alt={`${label} QR code`} className="mx-auto mt-3 w-full max-w-64" /><a href={preview[key]} download={`${selectedParticipant.registration_id}-${key === 'kitQr' ? 'kit' : 'lunch'}-qr.png`} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-bold text-white"><Download size={16} /> Download</a></article>)}</div></div>}
      {status && <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">{status}</p>}
    </section>
  </main>;
}