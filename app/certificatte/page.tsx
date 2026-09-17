"use client";

import { Award, CheckCircle2, Database, Download, Loader2, Mail } from "lucide-react";
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
};

const eventLabels: Record<string, string> = {
  cad: "CAD Expert",
  mechamind: "Mechamind",
  management: "Management Maestro",
  truss: "Truss Combat",
  poster: "Poster Presentation",
};

function makeCertificateId(name: string, identity: string) {
  const source = `${name.trim().toLowerCase()}-${identity.trim().toLowerCase()}`;
  let hash = 0;

  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) >>> 0;
  }

  return `CC2-P-${hash.toString(36).toUpperCase().padStart(7, "0").slice(-7)}`;
}

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
  const [registrationIdSearch, setRegistrationIdSearch] = useState("");
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [sendingCertificate, setSendingCertificate] = useState(false);
  const [forceResend, setForceResend] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState("");
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
        participants: participants
          .filter((participant) => idSet.has(Number(participant.registration_id)))
          .sort((left, right) => Number(left.registration_id) - Number(right.registration_id)),
      };
    });
  }, [participants]);
  const selectedSlot = participantSlots[selectedSlotIndex];
  const selectedParticipant = participants.find(
    (participant) => participant.normalized_email === selectedEmail,
  );
  const searchedParticipants = useMemo(() => {
    const query = registrationIdSearch.trim();
    if (!query) return [];
    return participants.filter((participant) => String(participant.registration_id).includes(query));
  }, [participants, registrationIdSearch]);
  useEffect(() => {
    setSelectedEmails(selectedSlot?.participants.map((participant) => participant.normalized_email) || []);
  }, [selectedSlot]);
  const certificateId = useMemo(
    () => makeCertificateId(participantName || "Participant Name", participantEmail || eventName),
    [participantEmail, participantName, eventName],
  );

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
          name: previewParticipant.name,
          email: previewParticipant.email,
          events: previewParticipant.events,
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
  }, [adminPassword, participants, pdfPreviewRevision, selectedEmail]);

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
      if (loadedParticipants[0]) {
        const first = loadedParticipants[0];
        setSelectedEmail(first.normalized_email);
        setParticipantName(first.name);
        setParticipantEmail(first.email);
        setEventName(first.events.map((event) => eventLabels[event] || event).join(", "));
      }
      setDeliveryStatus(`${loadedParticipants.length} unique participants loaded. Select a registration-ID range.`);
    } catch (error) {
      setDeliveryStatus(error instanceof Error ? error.message : "Unable to load participants.");
    } finally {
      setLoadingParticipants(false);
    }
  };

  const chooseParticipant = (email: string) => {
    setSelectedEmail(email);
    const participant = participants.find((item) => item.normalized_email === email);
    if (!participant) return;
    setParticipantName(participant.name);
    setParticipantEmail(participant.email);
    setEventName(participant.events.map((event) => eventLabels[event] || event).join(", "));
    setDeliveryStatus(participant.certificate_sent ? "This participant has already received a certificate." : "");
  };


  const downloadSelectedCertificates = async () => {
    const selectedParticipants = selectedSlot?.participants || [];
    if (selectedParticipants.length === 0 || downloadingCertificates) return;

    setDownloadingCertificates(true);
    setDeliveryStatus(`Generating certificates for registrations ${selectedSlot?.startId}-${selectedSlot?.endId}. This may take a few minutes.`);
    try {
      const response = await fetch("/api/certificate-preview-pdf", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: adminPassword,
          mode: "bulk",
          participants: selectedParticipants.map((participant) => ({
            name: participant.name,
            email: participant.email,
            events: participant.events,
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
      link.download = `participants-${selectedSlot?.startId}-${selectedSlot?.endId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setDeliveryStatus(`${selectedParticipants.length} certificates downloaded successfully.`);
    } catch (error) {
      setDeliveryStatus(error instanceof Error ? error.message : "Unable to download certificates.");
    } finally {
      setDownloadingCertificates(false);
    }
  };

  const sendCertificate = async (recipientEmails: string[] = selectedEmails) => {
    if (recipientEmails.length === 0) return;
    setSendingCertificate(true);
    let sent = 0;
    let alreadySent = 0;
    let failed = 0;
    const failureMessages = new Set<string>();

    for (let index = 0; index < recipientEmails.length; index += 1) {
      const email = recipientEmails[index];
      setDeliveryStatus(`Processing ${index + 1} of ${recipientEmails.length} certificates...`);
      try {
        const response = await fetch("/api/send-certificate-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: adminPassword, email, forceResend }),
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
        setParticipants((current) => current.map((participant) =>
          participant.normalized_email === email
            ? { ...participant, certificate_sent: true, certificate_sent_at: new Date().toISOString() }
            : participant,
        ));
      } catch (error) {
        failed += 1;
        failureMessages.add(error instanceof Error ? error.message : "Unknown delivery error.");
      }
    }

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
        {participants.length > 0 && selectedSlot && (
          <div className="mt-4 space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <select
                value={selectedSlotIndex}
                onChange={(event) => setSelectedSlotIndex(Number(event.target.value))}
                className="rounded-xl border border-emerald-200 bg-white px-4 py-3 outline-none focus:border-emerald-600"
              >
                {participantSlots.map((slot, index) => (
                  <option key={`${slot.startId}-${slot.endId}`} value={index}>
                    Registration IDs {slot.startId}-{slot.endId} ({slot.participants.length} participants)
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => sendCertificate()}
                disabled={selectedEmails.length === 0 || sendingCertificate}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-3 font-bold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sendingCertificate ? <Loader2 size={17} className="animate-spin" /> : <Mail size={17} />}
                Email range ({selectedEmails.length})
              </button>
            </div>
            <p className="text-sm font-semibold text-slate-600">
              This slot contains up to 50 paid registration IDs and {selectedSlot.participants.length} individual participants.
            </p>
            <div className="max-h-64 overflow-y-auto rounded-xl border border-emerald-200 bg-white">
              {selectedSlot.participants.map((participant) => (
                <button
                  key={participant.normalized_email}
                  type="button"
                  onClick={() => chooseParticipant(participant.normalized_email)}
                  className={`flex w-full items-center gap-3 border-b border-emerald-100 px-4 py-3 text-left last:border-0 ${selectedEmail === participant.normalized_email ? "bg-emerald-50" : ""}`}
                >
                  <span className="shrink-0 rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">ID {participant.registration_id}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-slate-800">{participant.name}</span>
                    <span className="block truncate text-xs text-slate-500">{participant.email}</span>
                  </span>
                  {participant.certificate_sent && <span className="shrink-0 text-xs font-bold text-emerald-700">Sent</span>}
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
              <label htmlFor="registration-id-search" className="text-sm font-bold text-sky-900">Search participant by registration ID</label>
              <input
                id="registration-id-search"
                type="search"
                inputMode="numeric"
                value={registrationIdSearch}
                onChange={(event) => setRegistrationIdSearch(event.target.value)}
                placeholder="Enter registration ID"
                className="mt-2 w-full rounded-xl border border-sky-200 bg-white px-4 py-3 outline-none focus:border-sky-600"
              />
              {registrationIdSearch.trim() && (
                <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border border-sky-200 bg-white">
                  {searchedParticipants.length > 0 ? searchedParticipants.map((participant) => (
                    <div key={participant.normalized_email} className="flex flex-wrap items-center gap-3 border-b border-sky-100 px-3 py-3 last:border-0">
                      <button type="button" onClick={() => chooseParticipant(participant.normalized_email)} className="min-w-0 flex-1 text-left">
                        <span className="block font-bold text-slate-800">ID {participant.registration_id} — {participant.name}</span>
                        <span className="block truncate text-xs text-slate-500">{participant.email}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => sendCertificate([participant.normalized_email])}
                        disabled={sendingCertificate}
                        className="rounded-lg bg-sky-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                      >
                        Email participant
                      </button>
                    </div>
                  )) : <p className="px-3 py-3 text-sm text-slate-500">No paid participant found for this registration ID.</p>}
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm font-semibold text-amber-900">
              <input
                type="checkbox"
                checked={forceResend}
                onChange={(event) => setForceResend(event.target.checked)}
                className="h-4 w-4 accent-amber-600"
              />
              Resend certificates already marked as delivered
            </label>
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
            <div className="ml-auto mr-5 mt-5 flex items-center gap-2 text-[15px] font-normal tracking-wide text-[#52645f]">
              <Award size={17} className="text-[#b58228]" /> Certificate ID: {certificateId}
            </div>

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
                in recognition of their enthusiastic participation in <strong className="font-bold text-[#174f42]">{eventName}</strong>,
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
            disabled={!selectedSlot || downloadingCertificates}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {downloadingCertificates
              ? <Loader2 size={16} className="animate-spin" />
              : <Download size={16} />}
            {downloadingCertificates
              ? "Generating range PDFs…"
              : `Download IDs ${selectedSlot?.startId}-${selectedSlot?.endId}`}
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
