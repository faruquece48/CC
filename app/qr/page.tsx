"use client";

import { Database, Download, Eye, Loader2, Mail, QrCode, Search, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatParticipantName } from "@/lib/participantName";

type Participant = {
  registration_id: number | string;
  name: string;
  email: string;
  normalized_email: string;
  is_ambassador: boolean;
  recipient_group: "participant" | "ambassador";
  qr_email_status?: "not_sent" | "sending" | "sent" | "failed";
  qr_email_sent_at?: string | null;
  qr_email_updated_at?: string | null;
  qr_email_error?: string | null;
};

type QrPreview = { kitQr: string; lunchQr: string; isAmbassador: boolean };
type QrDisplay = "kit" | "lunch" | "both";
type SendRecord = { status: "sent" | "failed" | "pending"; updatedAt: string; error?: string };
type SendHistory = Record<string, SendRecord>;
const historyKey = "participant-qr-email-history-v1";
const passwordKey = "participant-qr-admin-password-v1";
const participantKey = (participant: Participant) => `${participant.registration_id}:${participant.normalized_email}`;

export default function ParticipantQrPage() {
  const [adminPassword, setAdminPassword] = useState(process.env.NODE_ENV === "development" ? "local-development" : "");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [search, setSearch] = useState("");
  const [qrDisplay, setQrDisplay] = useState<QrDisplay>("both");
  const [slotIndex, setSlotIndex] = useState<number | "ambassadors">(0);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [preview, setPreview] = useState<QrPreview | null>(null);
  const [emailPreview, setEmailPreview] = useState<{ subject: string; html: string } | null>(null);
  const [previewingEmail, setPreviewingEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");
  const [sendHistory, setSendHistory] = useState<SendHistory>({});
  const [storageWarning, setStorageWarning] = useState("");
  useEffect(() => {
    try {
      const savedPassword = localStorage.getItem(passwordKey);
      if (savedPassword !== null) setAdminPassword(savedPassword);
      const saved = JSON.parse(localStorage.getItem(historyKey) || "{}");
      if (!saved || typeof saved !== "object" || Array.isArray(saved)) return;
      setSendHistory(Object.fromEntries(Object.entries(saved).filter(([, value]) => {
        const record = value as SendRecord;
        return record && ["sent", "failed", "pending"].includes(record.status) && typeof record.updatedAt === "string";
      })) as SendHistory);
    } catch { setStorageWarning("Saved sending history could not be loaded. Check Sent mail before resending."); }
  }, []);
  const saveHistory = (history: SendHistory) => {
    setSendHistory({ ...history });
    try { localStorage.setItem(historyKey, JSON.stringify(history)); }
    catch { setStorageWarning("Sending progress is available for this session only; browser storage is unavailable."); }
  };

  const registeredParticipants = useMemo(() => participants.filter((participant) => participant.recipient_group === "participant"), [participants]);
  const ambassadorParticipants = useMemo(() => participants.filter((participant) => participant.recipient_group === "ambassador"), [participants]);
  const slotParticipants = useMemo(() => slotIndex === "ambassadors"
    ? ambassadorParticipants
    : registeredParticipants.slice(slotIndex * 100, (slotIndex + 1) * 100), [registeredParticipants, ambassadorParticipants, slotIndex]);
  const selectedParticipant = participants.find((participant) => participant.normalized_email === selectedEmail);
  const visibleParticipants = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return slotParticipants;
    return participants.filter((participant) =>
      String(participant.registration_id).includes(query)
      || participant.name.toLowerCase().includes(query)
      || participant.email.toLowerCase().includes(query));
  }, [participants, slotParticipants, search]);
  const selectedRecipients = useMemo(() => {
    const selected = new Set(selectedEmails);
    return slotParticipants.filter((participant) => selected.has(participant.normalized_email));
  }, [slotParticipants, selectedEmails]);
  const remainingRecipients = selectedRecipients.filter((participant) => sendHistory[participantKey(participant)]?.status !== "sent");
  const sentCount = participants.filter((participant) => sendHistory[participantKey(participant)]?.status === "sent").length;

  const loadParticipants = async () => {
    setLoading(true);
    setStatus("");
    try {
      const sentRecords = Object.entries(sendHistory).filter(([,record])=>record.status==="sent").map(([key])=>{const separator=key.indexOf(":");return {registrationId:key.slice(0,separator),email:key.slice(separator+1)}}).filter(record=>record.registrationId&&record.email);
      const response = await fetch("/api/participant-qr", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword, action: "list", sentRecords }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.message || "Unable to load participants.");
      const loaded = (result.participants || []).map((participant: Participant) => ({ ...participant, name: formatParticipantName(participant.name) }));
      loaded.sort((a: Participant, b: Participant) => String(a.registration_id).localeCompare(String(b.registration_id), undefined, { numeric: true }) || a.normalized_email.localeCompare(b.normalized_email));
      const mergedHistory:SendHistory={...sendHistory};
      loaded.forEach((participant:Participant)=>{if(participant.qr_email_status==="sent"||participant.qr_email_status==="failed"){mergedHistory[participantKey(participant)]={status:participant.qr_email_status,updatedAt:participant.qr_email_sent_at||participant.qr_email_updated_at||new Date().toISOString(),...(participant.qr_email_error?{error:participant.qr_email_error}:{})}}});
      saveHistory(mergedHistory);
      setSlotIndex(0);
      setParticipants(loaded);
      setSelectedEmails(loaded.map((participant: Participant) => participant.normalized_email));
      const ambassadorOnly = loaded.filter((participant: Participant) => participant.recipient_group === "ambassador").length;
      setStatus(`${loaded.length - ambassadorOnly} unique paid participants and ${ambassadorOnly} unregistered campus ambassadors loaded.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to load participants.");
    } finally { setLoading(false); }
  };

  const selectParticipant = async (participant: Participant) => {
    setSelectedEmail(participant.normalized_email);
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
      setPreview({ kitQr: result.kitQr, lunchQr: result.lunchQr, isAmbassador: Boolean(result.isAmbassador) });
      setStatus(`QR codes generated for registration ${participant.registration_id}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to generate QR codes.");
    } finally { setGenerating(false); }
  };

  const previewEmail = async () => {
    if (!selectedParticipant || !adminPassword || previewingEmail) return;
    setPreviewingEmail(true); setStatus("Generating email preview...");
    try {
      const response = await fetch("/api/participant-qr", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: adminPassword, action: "preview-email", registrationId: selectedParticipant.registration_id, email: selectedParticipant.normalized_email }) });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.message || "Unable to preview the email.");
      setEmailPreview({ subject: result.subject, html: result.html }); setStatus("Email preview generated. No email was sent.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Unable to preview the email."); }
    finally { setPreviewingEmail(false); }
  };

  const sendToParticipants = async (recipients: Participant[]) => {
    if (!recipients.length || sending || !adminPassword) return;
    if (recipients.some((participant) => sendHistory[participantKey(participant)]?.status === "sent")
      && !window.confirm("Some selected participants already have a successful send recorded. Send their QR emails again? Use Send remaining only to skip them.")) return;
    if (recipients.some((participant) => sendHistory[participantKey(participant)]?.status === "pending")
      && !window.confirm("Some previous sends were interrupted without confirmation. Check the sender's Sent folder first; retrying may send duplicates. Continue?")) return;
    if (!window.confirm(`Email separate kit and lunch QR codes to ${recipients.length} participant(s)?`)) return;
    setSending(true);
    let sent = 0;
    let failed = 0;
    let consecutiveFailures = 0;
    const history = { ...sendHistory };
    const errors = new Set<string>();
    for (let index = 0; index < recipients.length; index += 1) {
      const participant = recipients[index];
      const key = participantKey(participant);
      history[key] = { status: "pending", updatedAt: new Date().toISOString() };
      saveHistory(history);
      setStatus(`Sending ${index + 1} of ${recipients.length}…`);
      try {
        const response = await fetch("/api/participant-qr", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: adminPassword, action: "send", registrationId: participant.registration_id, email: participant.normalized_email }),
        });
        const result = await response.json().catch(() => null);
        if (!response.ok) throw new Error(result?.message || `Unable to send registration ${participant.registration_id}.`);
        sent += 1;
        consecutiveFailures = 0;
        history[key] = { status: "sent", updatedAt: new Date().toISOString() };
        saveHistory(history);
      } catch (error) {
        failed += 1;
        consecutiveFailures += 1;
        const reason = error instanceof Error ? error.message : "Unknown delivery error.";
        errors.add(reason);
        history[key] = { status: "failed", updatedAt: new Date().toISOString(), error: reason };
        saveHistory(history);
        if (consecutiveFailures >= 3) {
          errors.add("Paused after three consecutive failures. Use Send remaining only after resolving the error.");
          break;
        }
      }
    }
    const remaining = recipients.filter((participant) => history[participantKey(participant)]?.status !== "sent").length;
    setStatus(`${sent} sent, ${failed} failed this attempt; ${remaining} remaining.${errors.size ? ` ${Array.from(errors).join(" ")}` : ""}`);
    setSending(false);
  };

  return <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-800 sm:px-6">
    <section className="mx-auto max-w-5xl rounded-3xl border border-emerald-200 bg-white p-6 shadow-xl sm:p-8">
      <div className="flex items-start gap-4"><div className="rounded-2xl bg-[#073f37] p-3 text-amber-300"><QrCode size={28} /></div><div><p className="text-xs font-extrabold uppercase tracking-[.22em] text-emerald-700">All unique paid participants</p><h1 className="mt-1 text-3xl font-extrabold text-[#073f37]">Kit & Lunch QR Codes</h1><p className="mt-2 text-sm text-slate-600">Generate and email a distinct signed code for each collection purpose.</p></div></div>
      <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900"><strong>Participant notice:</strong> Do not share or forward QR codes. Each kit and lunch code is personal and can be accepted only once.</div>
      <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_auto]"><input type="password" value={adminPassword} onChange={(event) => { const value = event.target.value; setAdminPassword(value); try { localStorage.setItem(passwordKey, value); } catch { setStorageWarning("The admin password could not be saved in this browser."); } }} placeholder="Admin password" className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600" /><button type="button" onClick={loadParticipants} disabled={!adminPassword || loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#073f37] px-5 py-3 font-bold text-white disabled:opacity-50">{loading ? <Loader2 className="animate-spin" size={18} /> : <Database size={18} />} Load participants</button></div>

      {participants.length > 0 && <>
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
          <p className="font-bold">{sentCount} sent · {participants.length - sentCount} without a confirmed send</p>
          <p className="mt-1">Sent status is synchronized through the shared database and is visible from both local and live websites. It records mail-server acceptance, not inbox delivery.</p>
        </div>
        <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-4">
          <label className="mb-4 block text-sm font-bold text-sky-900">Recipient slot
            <select value={slotIndex} disabled={sending} onChange={(event) => { const value=event.target.value; setSlotIndex(value === "ambassadors" ? "ambassadors" : Number(value)); setSelectedEmail(null); setPreview(null); }} className="mt-2 block w-full rounded-xl border border-sky-200 bg-white px-4 py-3">
              {Array.from({ length: Math.ceil(registeredParticipants.length / 100) }, (_, index) => <option key={index} value={index}>Slot {index + 1}: participants {index * 100 + 1}-{Math.min((index + 1) * 100, registeredParticipants.length)}</option>)}
              <option value="ambassadors">Campus Ambassador: {ambassadorParticipants.length} not registered in events</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm font-bold text-sky-900"><Search size={17} /> Search by registration ID, name, or email</label>
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Enter registration ID…" className="mt-2 w-full rounded-xl border border-sky-200 bg-white px-4 py-3 outline-none focus:border-sky-600" />
          <fieldset className="mt-4">
            <legend className="text-sm font-bold text-sky-900">QR code to view</legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {([["kit", "Kit only"], ["lunch", "Lunch only"], ["both", "Both"]] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setQrDisplay(value)} aria-pressed={qrDisplay === value} className={`rounded-xl border px-3 py-2 text-sm font-bold transition ${qrDisplay === value ? "border-sky-700 bg-sky-700 text-white" : "border-sky-200 bg-white text-sky-900 hover:border-sky-400"}`}>{label}</button>)}
            </div>
          </fieldset>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
            <label className="inline-flex items-center gap-2 font-bold text-sky-900"><input type="checkbox" checked={slotParticipants.length > 0 && selectedRecipients.length === slotParticipants.length} ref={(input) => { if (input) input.indeterminate = selectedRecipients.length > 0 && selectedRecipients.length < slotParticipants.length; }} onChange={(event) => setSelectedEmails((current) => event.target.checked ? Array.from(new Set([...current, ...slotParticipants.map((participant) => participant.normalized_email)])) : current.filter((email) => !slotParticipants.some((participant) => participant.normalized_email === email)))} className="h-5 w-5 accent-sky-700" /> Select all in this slot</label>
            <span className="font-bold text-sky-800">{selectedRecipients.length} of {slotParticipants.length} selected</span>
          </div>
          <div className="mt-3 max-h-96 overflow-y-auto rounded-xl border border-sky-200 bg-white">{visibleParticipants.length ? visibleParticipants.map((participant) => {
            const checked = selectedEmails.includes(participant.normalized_email);
            return <div key={`${participant.registration_id}-${participant.normalized_email}`} className={`flex items-center gap-3 border-b border-sky-100 px-4 py-3 last:border-0 ${selectedEmail === participant.normalized_email ? "bg-sky-100" : ""}`}>
              <input type="checkbox" checked={checked} onChange={() => setSelectedEmails((current) => checked ? current.filter((email) => email !== participant.normalized_email) : [...current, participant.normalized_email])} aria-label={`Select registration ${participant.registration_id}`} className="h-5 w-5 shrink-0 accent-sky-700" />
              <button type="button" onClick={() => selectParticipant(participant)} className="flex min-w-0 flex-1 items-center gap-3 text-left"><span className="shrink-0 rounded bg-slate-100 px-2 py-1 text-xs font-bold">ID {participant.registration_id}</span><span className="min-w-0"><span className="block font-bold">{participant.name}{participant.is_ambassador&&<span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-emerald-800">Campus Ambassador</span>}</span><span className="block truncate text-xs text-slate-500">{participant.email}</span></span></button>
              <span title={sendHistory[participantKey(participant)]?.error || sendHistory[participantKey(participant)]?.updatedAt} className="text-xs font-semibold text-slate-600">{sendHistory[participantKey(participant)]?.status === "sent" ? "Sent" : sendHistory[participantKey(participant)]?.status === "failed" ? "Failed" : sendHistory[participantKey(participant)]?.status === "pending" ? "Unconfirmed" : "Not tracked"}</span>
            </div>;
          }) : <p className="p-4 text-sm text-slate-500">No paid participant found.</p>}</div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => sendToParticipants(remainingRecipients)} disabled={!remainingRecipients.length || sending || !adminPassword} className="rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white disabled:opacity-50">Send remaining only ({remainingRecipients.length} selected)</button>
          <button type="button" onClick={() => sendToParticipants(selectedRecipients)} disabled={!selectedRecipients.length || sending} className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-3 font-bold text-white disabled:opacity-50">{sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Email selected {selectedRecipients.length}</button>
          <button type="button" onClick={previewEmail} disabled={!selectedParticipant || previewingEmail} className="inline-flex items-center gap-2 rounded-xl border border-sky-700 bg-white px-5 py-3 font-bold text-sky-800 disabled:opacity-50">{previewingEmail ? <Loader2 className="animate-spin" size={18} /> : <Eye size={18} />} Preview email</button><button type="button" onClick={() => selectedParticipant && sendToParticipants([selectedParticipant])} disabled={!selectedParticipant || sending} className="inline-flex items-center gap-2 rounded-xl bg-sky-700 px-5 py-3 font-bold text-white disabled:opacity-50"><Mail size={18} /> Email previewed participant</button>
        </div>
      </>}

      {emailPreview && <section className="mt-7 overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-lg"><div className="flex flex-col gap-3 border-b bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-emerald-700">Email preview - not sent</p><p className="mt-1 text-sm font-bold text-slate-800">{emailPreview.subject}</p></div><button type="button" onClick={() => setEmailPreview(null)} className="w-fit rounded-lg border px-4 py-2 text-sm font-bold">Close preview</button></div><div className="bg-[#dfe9e6] p-3 sm:p-6"><div className="overflow-hidden rounded-lg" dangerouslySetInnerHTML={{ __html: emailPreview.html }} /></div></section>}

      {generating && <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-slate-50 p-8 font-bold text-emerald-800"><Loader2 className="animate-spin" /> Generating QR codes…</div>}
      {preview && selectedParticipant && <div className="mt-7"><h2 className="text-xl font-extrabold text-[#073f37]">Registration {selectedParticipant.registration_id} — {selectedParticipant.name}</h2><div className={`mt-4 grid gap-5 ${qrDisplay === "both" ? "sm:grid-cols-2" : "mx-auto max-w-md"}`}>{([['kitQr', 'Kit Collection'], ['lunchQr', 'Lunch Collection']] as const).filter(([key]) => qrDisplay === "both" || (qrDisplay === "kit" ? key === "kitQr" : key === "lunchQr")).map(([key, label]) => <article key={key} className="rounded-2xl border border-slate-200 p-5 text-center"><h3 className="text-lg font-extrabold">{label}</h3><img src={preview[key]} alt={`${label} QR code`} className="mx-auto mt-3 w-full max-w-64" />{!preview.isAmbassador&&<><p className="mt-2 text-base font-extrabold text-slate-800">Registration ID: {selectedParticipant.registration_id}</p><p className="mt-1 text-xs font-semibold text-slate-500">Email ID: {selectedParticipant.email}</p></>}<a href={preview[key]} download={`${selectedParticipant.registration_id}-${key === 'kitQr' ? 'kit' : 'lunch'}-qr.png`} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-bold text-white"><Download size={16} /> Download</a></article>)}</div></div>}
      {storageWarning && <p className="mt-4 text-sm text-amber-800">{storageWarning}</p>}
      {status && <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">{status}</p>}
    </section>
  </main>;
}
