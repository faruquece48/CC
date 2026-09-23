"use client";

import { CheckCircle2, Database, Download, Loader2, Mail } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatParticipantName } from "@/lib/participantName";
import coordinatorSignature from "@/public/images/Signature_1.png";
import headSignature from "@/public/images/signature.png";

type DatabaseParticipant = {
  registration_id: number;
  name: string;
  email: string;
  normalized_email: string;
  events: string[];
  certificate_sent: boolean;
  certificate_sent_at: string | null;
  certificate_sent_events: string[];
};

const eventLabels: Record<string, string> = {
  cad: "CAD Expert",
  mechamind: "Mechamind",
  management: "Management Maestro",
  truss: "Truss Combat",
  poster: "Poster Presentation",
};

const certificateKey = (event: string, email: string) => `${event}::${email}`;
const splitCertificateKey = (key: string) => {
  const separator = key.indexOf("::");
  return { event: key.slice(0, separator), email: key.slice(separator + 2) };
};

export default function CertificatePage() {
  const [participantName, setParticipantName] = useState("Participant Name");
  const [eventName, setEventName] = useState("Construct Carnival 2.0");
  const [participantEmail, setParticipantEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState(
    process.env.NODE_ENV === "development" ? "local-development" : "",
  );
  const [participants, setParticipants] = useState<DatabaseParticipant[]>([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);
  const [selectedPreviewEvent, setSelectedPreviewEvent] = useState("");
  const [registrationIdSearch, setRegistrationIdSearch] = useState("");
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [sendingCertificate, setSendingCertificate] = useState(false);
  const [forceResend, setForceResend] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [failedEmails, setFailedEmails] = useState<string[]>([]);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");
  const [pdfPreviewError, setPdfPreviewError] = useState("");
  const [loadingPdfPreview, setLoadingPdfPreview] = useState(false);
  const [downloadingCertificates, setDownloadingCertificates] = useState(false);
  const [pdfPreviewRevision, setPdfPreviewRevision] = useState(0);
  const participantSlots = useMemo(() => {
    const registrationIds = Array.from(new Set(participants.map((participant) => Number(participant.registration_id))))
      .filter(Number.isFinite)
      .sort((left, right) => left - right);
    return Array.from({ length: Math.ceil(registrationIds.length / 50) }, (_, slotIndex) => {
      const ids = registrationIds.slice(slotIndex * 50, (slotIndex + 1) * 50);
      const idSet = new Set(ids);
      return {
        startId: ids[0],
        endId: ids[ids.length - 1],
        participants: participants.filter((participant) => idSet.has(Number(participant.registration_id)))
          .sort((left, right) => Number(left.registration_id) - Number(right.registration_id)),
      };
    });
  }, [participants]);
  const selectedSlot = participantSlots[selectedSlotIndex];
  const slotEventGroups = useMemo(() => Array.from(new Set((selectedSlot?.participants || []).flatMap((participant) => participant.events || []))).sort().map((event) => ({
    event,
    label: eventLabels[event] || event,
    participants: (selectedSlot?.participants || []).filter((participant) => participant.events.includes(event)),
  })), [selectedSlot]);
  const certificateTotal = participants.reduce((total, participant) => total + participant.events.length, 0);
  const sentTotal = participants.reduce((total, participant) => total + (participant.certificate_sent_events?.length || 0), 0);
  const remainingTotal = Math.max(0, certificateTotal - sentTotal);
  const selectedParticipant = participants.find((participant) => participant.normalized_email === selectedEmail);
  const query = registrationIdSearch.trim().toLowerCase();
  const matchesSearch = (participant: DatabaseParticipant) => !query
    || String(participant.registration_id).includes(query)
    || participant.name.toLowerCase().includes(query)
    || participant.email.toLowerCase().includes(query);
  const absentEntries = slotEventGroups.flatMap((group) => group.participants
    .filter((participant) => matchesSearch(participant) && !selectedEmails.includes(certificateKey(group.event, participant.normalized_email)))
    .map((participant) => ({ participant, event: group.event, label: group.label })));

  useEffect(() => {
    const previewParticipant = participants.find(
      (participant) => participant.normalized_email === selectedEmail,
    );
    if (!previewParticipant || !adminPassword) {
      setPdfPreviewUrl("");
      return;
    }

    let active = true;
    let objectUrl = "";
    setLoadingPdfPreview(true);
    setPdfPreviewError("");
    fetch(`/api/certificate-preview-pdf?revision=${pdfPreviewRevision + 1}`, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: adminPassword,
        participants: [{
          registrationId: Number(previewParticipant.registration_id),
          name: previewParticipant.name,
          email: previewParticipant.email,
          events: [selectedPreviewEvent || previewParticipant.events[0]],
        }],
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const result = await response.json().catch(() => null);
          throw new Error(result?.message || "Unable to generate the PDF preview.");
        }
        return response.blob();
      })
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setPdfPreviewUrl(objectUrl);
      })
      .catch((error) => {
        if (active) setPdfPreviewError(error instanceof Error ? error.message : "Unable to generate the PDF preview.");
      })
      .finally(() => {
        if (active) setLoadingPdfPreview(false);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [adminPassword, participants, pdfPreviewRevision, selectedEmail, selectedPreviewEvent]);

  const loadParticipants = async () => {
    setLoadingParticipants(true);
    setDeliveryStatus("");
    try {
      const requestParticipants = () => fetch("/api/certificate-participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword }),
      });
      let response = await requestParticipants();
      if (response.status === 503) {
        await new Promise((resolve) => setTimeout(resolve, 750));
        response = await requestParticipants();
      }
      const responseText = await response.text();
      let result: any;
      try {
        result = responseText ? JSON.parse(responseText) : null;
      } catch {
        result = null;
      }
      result ||= { success: false, message: `The participant API returned an invalid response (HTTP ${response.status}).` };
      if (!response.ok) throw new Error(result.message || "Unable to load participants.");
      const loadedParticipants: DatabaseParticipant[] = (result.participants || []).map((participant: DatabaseParticipant) => ({
        ...participant,
        name: formatParticipantName(participant.name),
      }));
      setParticipants(loadedParticipants);
      setSelectedSlotIndex(0);
      const registrationIds = Array.from(new Set(loadedParticipants.map((participant) => Number(participant.registration_id)))).sort((left, right) => left - right);
      const firstIdSet = new Set(registrationIds.slice(0, 50));
      const firstSlotParticipants = loadedParticipants.filter((participant) => firstIdSet.has(Number(participant.registration_id)));
      setSelectedEmails(firstSlotParticipants.flatMap((participant) => participant.events.map((event) => certificateKey(event, participant.normalized_email))));
      if (loadedParticipants[0]) {
        const first = loadedParticipants[0];
        setSelectedEmail(first.normalized_email);
        setParticipantName(first.name);
        setParticipantEmail(first.email);
        setSelectedPreviewEvent(first.events[0] || "");
        setEventName(eventLabels[first.events[0]] || first.events[0] || "Construct Carnival 2.0");
      }
      setDeliveryStatus(`${loadedParticipants.length} unique participants loaded. Each ID segment starts selected. Untick absent participants before downloading or sending certificates.`);
    } catch (error) {
      setDeliveryStatus(error instanceof Error ? error.message : "Unable to load participants.");
    } finally {
      setLoadingParticipants(false);
    }
  };

  const selectSlot = (slotIndex: number) => {
    setSelectedSlotIndex(slotIndex);
    setRegistrationIdSearch("");
    const slot = participantSlots[slotIndex];
    setSelectedEmails((slot?.participants || []).flatMap((participant) =>
      participant.events.map((event) => certificateKey(event, participant.normalized_email)),
    ));
  };
  const chooseParticipant = (email: string, event: string) => {
    setSelectedEmail(email);
    const participant = participants.find((item) => item.normalized_email === email);
    if (!participant) return;
    setParticipantName(participant.name);
    setParticipantEmail(participant.email);
    setSelectedPreviewEvent(event);
    setEventName(eventLabels[event] || event);
    setDeliveryStatus(participant.certificate_sent_events?.includes(event) ? "This participant has already received a certificate for this event." : "");
  };


  const downloadSelectedCertificates = async () => {
    const selectedCertificates = selectedEmails.map((key) => {
      const { event, email } = splitCertificateKey(key);
      const participant = participants.find((item) => item.normalized_email === email);
      return participant ? { participant, event } : null;
    }).filter((item): item is { participant: DatabaseParticipant; event: string } => Boolean(item));
    if (selectedCertificates.length === 0 || downloadingCertificates) return;

    setDownloadingCertificates(true);
    setDeliveryStatus(`Generating ${selectedCertificates.length} selected event certificates. This may take a few minutes.`);
    try {
      const response = await fetch("/api/certificate-preview-pdf", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: adminPassword,
          mode: "bulk",
          participants: selectedCertificates.map(({ participant, event }) => ({
            registrationId: Number(participant.registration_id),
            name: participant.name,
            email: participant.email,
            events: [event],
          })),
        }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || "Unable to generate the certificate download.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `selected-event-certificates-${selectedCertificates.length}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setDeliveryStatus(`${selectedCertificates.length} event certificates downloaded successfully.`);
    } catch (error) {
      setDeliveryStatus(error instanceof Error ? error.message : "Unable to download certificates.");
    } finally {
      setDownloadingCertificates(false);
    }
  };
  const sendCertificate = async (recipientKeys: string[] = selectedEmails) => {
    if (recipientKeys.length === 0) return;
    setSendingCertificate(true);
    let sent = 0;
    let alreadySent = 0;
    let failed = 0;
    const failureMessages = new Set<string>();
    const nextFailed = new Set(failedEmails.filter((key) => !recipientKeys.includes(key)));

    for (let index = 0; index < recipientKeys.length; index += 1) {
      const key = recipientKeys[index];
      const { event, email } = splitCertificateKey(key);
      setDeliveryStatus(`Processing ${index + 1} of ${recipientKeys.length} event certificates...`);
      try {
        const response = await fetch("/api/send-certificate-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: adminPassword, email, event, forceResend }),
        });
        const responseText = await response.text();
        let result: any;
        try {
          result = responseText ? JSON.parse(responseText) : null;
        } catch {
          result = null;
        }
        result ||= { success: false, message: `The certificate email API returned an invalid response (HTTP ${response.status}).` };
        if (!response.ok) throw new Error(result.message || "Unable to send certificate.");
        if (result.alreadySent) alreadySent += 1;
        else sent += 1;
        nextFailed.delete(key);
        setParticipants((current) => current.map((participant) =>
          participant.normalized_email === email
            ? { ...participant, certificate_sent_events: Array.from(new Set([...(participant.certificate_sent_events || []), event])) }
            : participant,
        ));
      } catch (error) {
        failed += 1;
        failureMessages.add(error instanceof Error ? error.message : "Unknown delivery error.");
        nextFailed.add(key);
      }
    }

    setFailedEmails(Array.from(nextFailed));
    const failureDetail = failureMessages.size > 0
      ? ` ${Array.from(failureMessages).join(" ")}`
      : "";
    setDeliveryStatus(`${sent} sent, ${alreadySent} already delivered, ${failed} failed.${failureDetail}`);
    setSendingCertificate(false);
  };
  return (
    <div className="certificate-page min-h-screen bg-[#f3f5f2] px-4 py-10 sm:px-6 lg:px-8">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }

          body * {
            visibility: hidden !important;
          }

          #participation-certificate,
          #participation-certificate * {
            visibility: visible !important;
          }

          #participation-certificate {
            position: fixed !important;
            inset: 0 !important;
            width: 297mm !important;
            height: 210mm !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="screen-controls mx-auto mb-7 flex max-w-6xl flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#dcece7] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#085041]">
            <CheckCircle2 size={14} /> Participation certificate
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#102b25] sm:text-4xl">
            Certificate preview
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Select a participant to preview, download, or email their certificate PDF.
          </p>
        </div>
      </div>

      <section className="screen-controls mx-auto mb-6 max-w-6xl rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm">
        <div className="flex items-center gap-2 text-[#085041]">
          <Database size={19} />
          <h2 className="font-extrabold">Unique participant database</h2>
        </div>
        <p className="mt-1 text-sm text-slate-600">Load all unique participants from PostgreSQL, preview their personalized certificate, and send it through the configured Gmail account.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            type="password"
            value={adminPassword}
            onChange={(event) => setAdminPassword(event.target.value)}
            placeholder="Admin password"
            className="rounded-xl border border-emerald-200 bg-white px-4 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
          />
          <button
            type="button"
            onClick={loadParticipants}
            disabled={loadingParticipants || !adminPassword}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#085041] px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingParticipants ? <Loader2 size={17} className="animate-spin" /> : <Database size={17} />}
            Load participants
          </button>
        </div>
        {participants.length > 0 && <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-xs font-bold uppercase text-emerald-700">Total sent</p><p className="mt-1 text-3xl font-black text-emerald-800">{sentTotal}</p></div><div className="rounded-xl border border-red-200 bg-red-50 p-4"><p className="text-xs font-bold uppercase text-red-700">Failed</p><p className="mt-1 text-3xl font-black text-red-800">{failedEmails.length}</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-600">Remaining</p><p className="mt-1 text-3xl font-black text-slate-800">{remainingTotal}</p></div></div>}
        {failedEmails.length > 0 && <button type="button" onClick={() => sendCertificate(failedEmails)} disabled={sendingCertificate} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-red-700 px-5 py-3 font-bold text-white disabled:opacity-50">{sendingCertificate ? <Loader2 size={17} className="animate-spin" /> : <Mail size={17} />} Retry failed emails ({failedEmails.length})</button>}
        {participants.length > 0 && selectedSlot && (
          <div className="mt-4 space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
              <select value={selectedSlotIndex} onChange={(event) => selectSlot(Number(event.target.value))} className="rounded-xl border border-emerald-200 bg-white px-4 py-3 outline-none focus:border-emerald-600">
                {participantSlots.map((slot, index) => <option key={`${slot.startId}-${slot.endId}`} value={index}>Registration IDs {slot.startId}-{slot.endId} ({slot.participants.length} participants)</option>)}
              </select>
              <button type="button" onClick={() => sendCertificate()} disabled={!selectedEmails.length || sendingCertificate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-3 font-bold text-white disabled:opacity-50">{sendingCertificate ? <Loader2 size={17} className="animate-spin" /> : <Mail size={17} />} Email present ({selectedEmails.length})</button>
              <button type="button" onClick={downloadSelectedCertificates} disabled={!selectedEmails.length || downloadingCertificates} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-700 px-5 py-3 font-bold text-white disabled:opacity-50">{downloadingCertificates ? <Loader2 size={17} className="animate-spin" /> : <Download size={17} />} Download present ({selectedEmails.length})</button>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong>Attendance:</strong> All registered events in this segment start selected. Untick a participant under an event to mark them absent from that event. A participant absent from every registered event will receive no certificate.</div>
            <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
              <input type="search" value={registrationIdSearch} onChange={(event) => setRegistrationIdSearch(event.target.value)} placeholder="Search this segment by ID, name, or email" className="rounded-xl border border-emerald-200 bg-white px-4 py-3 outline-none focus:border-emerald-600"/>
              <button type="button" onClick={() => setSelectedEmails(selectedSlot.participants.flatMap((participant) => participant.events.map((event) => certificateKey(event, participant.normalized_email))))} className="rounded-xl bg-emerald-100 px-4 py-3 text-sm font-bold text-emerald-900">Mark all present</button>
              <button type="button" onClick={() => setSelectedEmails([])} className="rounded-xl bg-red-100 px-4 py-3 text-sm font-bold text-red-800">Mark all absent</button>
            </div>

            {slotEventGroups.map((group) => {
              const eventParticipants = group.participants.filter(matchesSearch);
              return (
                <section key={group.event} className="overflow-hidden rounded-xl border border-emerald-200 bg-white">
                  <div className="flex items-center justify-between bg-[#164b40] px-4 py-3 text-white">
                    <h3 className="font-extrabold">{group.label}</h3>
                    <span className="text-xs font-bold">{eventParticipants.length} registered</span>
                  </div>
                  {eventParticipants.map((participant) => {
                    const key = certificateKey(group.event, participant.normalized_email);
                    const checked = selectedEmails.includes(key);
                    return (
                      <div key={participant.normalized_email} className={`flex items-center gap-3 border-b border-emerald-100 px-4 py-3 last:border-0 ${checked ? "" : "bg-red-50"}`}>
                        <input type="checkbox" checked={checked} onChange={() => setSelectedEmails((current) => checked ? current.filter((item) => item !== key) : [...current, key])} className="h-5 w-5 shrink-0 accent-emerald-700" aria-label={`Mark ${participant.name} present for ${group.label}`}/>
                        <button type="button" onClick={() => chooseParticipant(participant.normalized_email, group.event)} className="flex min-w-0 flex-1 items-center gap-3 text-left"><span className="shrink-0 rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">ID {participant.registration_id}</span><span className="min-w-0"><span className="block font-bold text-slate-800">{participant.name}</span><span className="block truncate text-xs text-slate-500">{participant.email}</span></span></button>
                        {!checked && <span className="shrink-0 text-xs font-black uppercase text-red-700">Absent</span>}
                        {participant.certificate_sent_events?.includes(group.event) && <span className="shrink-0 text-xs font-bold text-emerald-700">Sent</span>}
                      </div>
                    );
                  })}
                  {!eventParticipants.length && <p className="p-5 text-center text-sm text-slate-500">No participant found for this event.</p>}
                </section>
              );
            })}

            <section className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-center justify-between gap-3"><h3 className="font-extrabold text-red-900">Absent participants in this segment</h3><span className="rounded-full bg-red-200 px-3 py-1 text-xs font-black text-red-900">{absentEntries.length}</span></div>
              {absentEntries.length ? <div className="mt-3 grid gap-2 sm:grid-cols-2">{absentEntries.map(({ participant, event, label }) => <div key={`${event}-${participant.normalized_email}`} className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm"><span className="font-bold text-slate-800">ID {participant.registration_id} — {participant.name}</span><span className="block text-xs font-semibold text-red-700">Absent: {label}</span></div>)}</div> : <p className="mt-2 text-sm text-red-700">No participant is marked absent in this segment.</p>}
            </section>
            <label className="flex items-center gap-2 text-sm font-semibold text-amber-900"><input type="checkbox" checked={forceResend} onChange={(event) => setForceResend(event.target.checked)} className="h-4 w-4 accent-amber-600"/> Resend certificates already marked as delivered</label>
          </div>
        )}        {deliveryStatus && <p className="mt-3 text-sm font-semibold text-[#174f42]">{deliveryStatus}</p>}
      </section>

      <div className="hidden">
        <h2 className="text-lg font-extrabold text-[#102b25]">HTML preview</h2>
        <p className="text-sm text-slate-600">Browser-rendered certificate used on this page.</p>
      </div>
      <div className="hidden">
        <article
          id="participation-certificate"
          className="relative mx-auto aspect-[1.414/1] min-w-[900px] overflow-hidden bg-[#fffdf7] shadow-2xl shadow-slate-900/20"
          aria-label={`Certificate of participation for ${participantName || "Participant Name"}`}
        >
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 900 636" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <pattern id="certificate-security-grid" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(7)">
                <path d="M0 0V12M6 0V12" stroke="#17708b" strokeWidth="0.35" opacity="0.12" />
              </pattern>
              <pattern id="certificate-security-cross" width="18" height="18" patternUnits="userSpaceOnUse">
                <path d="M0 9H18M9 0V18" stroke="#17708b" strokeWidth="0.25" opacity="0.07" />
              </pattern>
            </defs>
            <rect x="17" y="17" width="866" height="602" fill="url(#certificate-security-grid)" />
            <rect x="17" y="17" width="866" height="602" fill="url(#certificate-security-cross)" />
            <rect x="17" y="17" width="866" height="602" fill="none" stroke="#176f8f" strokeWidth="2" />
            <rect x="29" y="29" width="842" height="578" fill="none" stroke="#176f8f" strokeWidth="1" />
            <g fill="none" stroke="#176f8f" strokeWidth="2">
              <path d="M17 57V17H57M29 69V29H69M43 17V43H17" />
              <path d="M843 17H883V57M831 29H871V69M883 43H857V17" />
              <path d="M17 579V619H57M29 567V607H69M43 619V593H17" />
              <path d="M843 619H883V579M831 607H871V567M883 593H857V619" />
            </g>
          </svg>

          <div className="relative z-10 flex h-full flex-col items-center px-32 pb-20 pt-10 text-center">
            <div className="absolute left-1/2 top-[60px] flex w-full -translate-x-1/2 flex-col items-center px-28 text-center">
              <div className="mb-7 flex items-center justify-center gap-3 text-center">
                <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full border-2 border-[#d5ad5f] bg-white p-1.5 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo/blue-main.svg" alt="Construct Carnival logo" className="h-full w-full object-contain" />
                </div>
                <div className="flex h-[44px] flex-col justify-center border-l border-[#d2be8d] pl-3 text-left">
                  <p className="text-[16px] font-black tracking-[0.22em] text-[#07989c]">CONSTRUCT</p>
                  <p className="bg-gradient-to-r from-[#f05a28] via-[#e83e72] to-[#9c3fe4] bg-clip-text text-[16px] font-black tracking-[0.18em] text-transparent">CARNIVAL 2.0</p>
                </div>
              </div>

              <p className="text-[17px] font-bold uppercase tracking-[0.48em] text-[#b58228]">
                Certificate of
              </p>
              <h2 className="mt-2 text-[72px] font-bold leading-none tracking-wide text-[#113f35]" style={{ fontFamily: '"Lora", serif' }}>
                Participation
              </h2>

              <p className="relative top-5 mt-8 text-[21px] italic text-[#66716e]" style={{ fontFamily: '"Lora", serif' }}>This certificate is proudly presented to</p>
              <p
                className="mt-[54px] min-h-[82px] max-w-[760px] border-b-2 border-[#c9a457] px-10 text-[62px] font-normal leading-[1.15] text-[#172e29]"
                style={{
                  fontFamily: '"Edwardian Script ITC", "Great Vibes", cursive',
                  textTransform: "capitalize",
                  wordSpacing: "0.22em",
                }}
              >
                {(participantName.trim() || "Participant Name").split(/\s+/).map((word, index) => (
                  <span key={`${word}-${index}`} className="inline-block">
                    {index > 0 && <span aria-hidden="true">&nbsp;&nbsp;</span>}
                    <span className="text-[1.2em] uppercase">{word.charAt(0).toUpperCase()}</span>
                    <span className="lowercase">{word.slice(1).toLowerCase()}</span>
                  </span>
                ))}
              </p>

              <p className="mt-[23px] max-w-3xl text-justify text-[17px] leading-8 text-[#52615e]">
                in recognition of their enthusiastic participation in <strong className="font-bold text-[#174f42]">Construct Carnival 2.0</strong>,
                organized by the Department of Building Engineering &amp; Construction Management at Rajshahi University of Engineering &amp; Technology.
              </p>
            </div>

            <div className="absolute bottom-[26px] left-0 grid w-full grid-cols-2 items-end">
              <div className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coordinatorSignature.src}
                  alt="Event coordinator signature"
                  className="mx-auto h-10 w-36 object-contain object-bottom"
                />
                <div className="mx-auto h-px w-52 bg-[#c29339]" />
                <p className="mt-2 text-[15px] font-extrabold uppercase tracking-[0.08em] text-[#173e36]">Event Coordinator</p>
                <p className="mt-1 text-[13px] tracking-wide text-[#52645f]">Construct Carnival 2.0</p>
              </div>

              <div className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={headSignature.src}
                  alt="Head signature"
                  className="mx-auto h-12 w-36 object-contain object-bottom"
                />
                <div className="mx-auto h-px w-52 bg-[#c29339]" />
                <p className="mt-2 text-[15px] font-extrabold uppercase tracking-[0.08em] text-[#173e36]">Head</p>
                <p className="mt-1 text-[13px] tracking-wide text-[#52645f]">Dept. of BECM, RUET</p>
              </div>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo/certificate_logo.png"
                alt="Construct Carnival certificate seal"
                className="absolute bottom-0 left-1/2 h-[104px] w-[104px] -translate-x-1/2 rounded-full object-contain"
              />
            </div>
          </div>
        </article>
      </div>

      <div className="screen-controls mx-auto mb-3 mt-8 flex max-w-6xl items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-[#102b25]">Email PDF preview</h2>
          <p className="text-sm text-slate-600">
            Exact A4 PDF for the participant currently selected in the preview list.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={downloadSelectedCertificates}
            disabled={!selectedEmails.length || downloadingCertificates}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {downloadingCertificates
              ? <Loader2 size={16} className="animate-spin" />
              : <Download size={16} />}
            {downloadingCertificates
              ? "Generating selected PDFs..."
              : `Download selected certificates (${selectedEmails.length})`}
          </button>
          {pdfPreviewUrl && (
            <a
              href={pdfPreviewUrl}
              download={`${selectedParticipant?.registration_id || "certificate"}.pdf`}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-600 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700"
            >
              <Download size={16} /> Download preview
            </a>
          )}
          <button
            type="button"
            onClick={() => setPdfPreviewRevision((revision) => revision + 1)}
            disabled={!selectedEmail || loadingPdfPreview}
            className="rounded-lg bg-[#085041] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            Refresh PDF preview
          </button>
        </div>
      </div>
      <div className="screen-controls mx-auto max-w-6xl overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-xl">
        {loadingPdfPreview ? (
          <div className="flex aspect-[1.414/1] items-center justify-center gap-2 text-sm font-bold text-[#085041]">
            <Loader2 size={20} className="animate-spin" /> Generating PDF preview…
          </div>
        ) : pdfPreviewError ? (
          <div className="flex aspect-[1.414/1] items-center justify-center p-8 text-center text-sm font-semibold text-red-700">
            {pdfPreviewError}
          </div>
        ) : pdfPreviewUrl ? (
          <iframe
            src={`${pdfPreviewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&page=1`}
            title="Email certificate PDF preview"
            className="aspect-[1.414/1] w-full border-0"
          />
        ) : (
          <div className="flex aspect-[1.414/1] items-center justify-center p-8 text-center text-sm text-slate-500">
            Load and select a participant to display the email PDF.
          </div>
        )}
      </div>
    </div>
  );
}
