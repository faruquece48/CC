"use client";

import { Database, Loader2, Mail, Search, Send, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatParticipantName } from "@/lib/participantName";
import { buildParticipantMessageEmail } from "@/lib/participantMessageEmail";
import { isMessageBatch, type MessageBatch } from "@/lib/messageBatch";

type Participant = {
  registration_id: number;
  name: string;
  email: string;
  normalized_email: string;
};

type Team = {
  id: number;
  registrationId: number;
  teamName: string;
  event: string;
  emails: string[];
};

type Audience = "all" | "team" | "individual";
type TeamScope = "one" | "truss" | "poster" | "both";
type IndividualScope = "all" | "one";

const batchStorageKey = "participant-message-pending-batch";

export default function ParticipantMessagePage() {
  const [adminPassword, setAdminPassword] = useState(
    process.env.NODE_ENV === "development" ? "local-development" : "",
  );
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [individualEmails, setIndividualEmails] = useState<string[]>([]);
  const [audience, setAudience] = useState<Audience>("all");
  const [teamScope, setTeamScope] = useState<TeamScope>("truss");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [individualScope, setIndividualScope] = useState<IndividualScope>("all");
  const [selectedIndividual, setSelectedIndividual] = useState("");
  const [search, setSearch] = useState("");
  const [includeSchedule, setIncludeSchedule] = useState(true);
  const [subject, setSubject] = useState("Official Notice: Revised Event Schedule for Construct Carnival 2.0");
  const [message, setMessage] = useState(`We sincerely apologize for the change to the event schedule.

Due to the NESCO job recruitment examination being held on 2 October 2026, Construct Carnival 2.0 has been rescheduled to Saturday, 3 October 2026. This adjustment has been made to avoid a conflict and ensure that all participants can attend the event comfortably.

Kit Collection:
• Friday, 2 October 2026, 5:00 PM–6:00 PM
• Saturday, 3 October 2026, 8:00 AM–9:00 AM

The main event program will take place on Saturday, 3 October 2026. We regret any inconvenience this change may cause and sincerely appreciate your understanding and cooperation.

Note: For Truss Combat participants who are also registered in other segments, truss loading times will be coordinated with their other event schedules to avoid timing conflicts.

We look forward to welcoming you to Construct Carnival 2.0.`);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [onlineBatchId, setOnlineBatchId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [pendingBatch, setPendingBatch] = useState<MessageBatch | null>(null);
  const [previouslySentEmails, setPreviouslySentEmails] = useState("");
  const [skipFirstCount, setSkipFirstCount] = useState(81);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(batchStorageKey) || "null");
      if (isMessageBatch(saved)) setPendingBatch(saved);
    } catch { /* A damaged or unavailable saved batch must not block the page. */ }
  }, []);

  const saveBatch = (batch: MessageBatch) => {
    setPendingBatch(batch);
    try { localStorage.setItem(batchStorageKey, JSON.stringify(batch)); } catch { /* Keep retry progress in memory if storage is unavailable. */ }
  };

  const batchRequest = async (body: Record<string, unknown>) => {
    const response = await fetch("/api/participant-message", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, password: adminPassword }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) throw new Error(result?.message || "Unable to access the online batch.");
    return result.batch as MessageBatch | null;
  };

  const uploadBatch = async (batch: MessageBatch) => {
    const identified = { ...batch, id: batch.id || crypto.randomUUID() };
    saveBatch(identified); // Preserve the same ID if the upload response is interrupted.
    const saved = await batchRequest({ action: "save-batch", batch: identified });
    if (!saved) throw new Error("The server did not return the saved batch.");
    saveBatch(saved);
    setOnlineBatchId(saved.id!);
    return saved;
  };

  const syncBatch = async (upload: boolean) => {
    if (sending || syncing || !adminPassword) return;
    if (!upload && pendingBatch && onlineBatchId !== pendingBatch.id
      && !window.confirm("Save this browser's batch online first if you need to keep it. Loading an online batch replaces the local copy. Continue?")) return;
    setSyncing(true);
    try {
      const batch = upload && pendingBatch ? await uploadBatch(pendingBatch)
        : await batchRequest({ action: "load-batch" });
      if (batch) { saveBatch(batch); setOnlineBatchId(batch.id!); }
      setStatus(batch ? `Batch saved online: ${batch.sent} sent; ${batch.remaining.length} remaining. No emails were sent.` : "No online batch found. Save this browser's batch online first.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Unable to sync batch."); }
    finally { setSyncing(false); }
  };

  const reviewDelivery = async (sent: boolean) => {
    if (!pendingBatch?.sendingEmail || sending || syncing) return;
    if (!window.confirm(`Stop sending in other browsers and check the sender's Sent folder. Confirm that the email to ${pendingBatch.sendingEmail} ${sent ? "was sent" : "was NOT sent"}?`)) return;
    setSyncing(true);
    try {
      const batch = await batchRequest({ action: "resolve-batch", batchId: pendingBatch.id, email: pendingBatch.sendingEmail, sent });
      if (batch) saveBatch(batch);
      setStatus("Delivery review saved online.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Unable to save review."); }
    finally { setSyncing(false); }
  };

  const participantByEmail = useMemo(
    () => new Map(participants.map((participant) => [participant.normalized_email, participant])),
    [participants],
  );  const individualEmailSet = useMemo(() => new Set(individualEmails), [individualEmails]);
  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return participants.filter((participant) =>
      individualEmailSet.has(participant.normalized_email)
      && (String(participant.registration_id).includes(query)
      || participant.name.toLowerCase().includes(query)
      || participant.email.toLowerCase().includes(query)))
      .slice(0, 30);
  }, [individualEmailSet, participants, search]);
  const selectedTeamData = teams.find((team) => String(team.id) === selectedTeam);
  const recipientEmails = useMemo(() => {
    if (audience === "all") return participants.map((participant) => participant.normalized_email);
    if (audience === "team") {
      if (teamScope === "one") return Array.from(new Set(selectedTeamData?.emails || []));
      const allowedEvents = teamScope === "both" ? new Set(["truss", "poster"]) : new Set([teamScope]);
      return Array.from(new Set(teams
        .filter((team) => allowedEvents.has(team.event.trim().toLowerCase()))
        .flatMap((team) => team.emails)));
    }
    if (individualScope === "all") return individualEmails;
    return selectedIndividual ? [selectedIndividual] : [];
  }, [audience, individualEmails, individualScope, participants, selectedIndividual, selectedTeamData, teamScope, teams]);

  const loadPaidParticipants = async () => {
    setLoading(true);
    setStatus("");
    try {
      const response = await fetch("/api/participant-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword, action: "list" }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.message || "Unable to load paid participants.");
      const loadedParticipants = (result.participants || []).map((participant: Participant) => ({
        ...participant,
        name: formatParticipantName(participant.name),
      }));
      setParticipants(loadedParticipants);
      setTeams(result.teams || []);
      setIndividualEmails(result.individualEmails || []);
      setStatus(`${loadedParticipants.length} unique paid participants loaded.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to load paid participants.");
    } finally {
      setLoading(false);
    }
  };

  const sendMessages = async (resume = false, skipFirst = 0) => {
    if (sending || syncing || !adminPassword) return;
    if (!Number.isInteger(skipFirst) || skipFirst < 0 || (!resume && skipFirst >= recipientEmails.length)) return;
    let batch: MessageBatch = resume && pendingBatch
      ? { ...pendingBatch, remaining: [...pendingBatch.remaining] }
      : { subject: subject.trim(), message: message.trim(), includeSchedule, remaining: recipientEmails.slice(skipFirst).filter((email) => !previouslySentEmails.toLowerCase().split(/[\s,;]+/).includes(email)), sent: 0 };
    if (!batch.subject || !batch.message || !batch.remaining.length) return;
    if (!resume && pendingBatch?.remaining.length && !window.confirm("A batch still has unsent recipients. Starting a new batch replaces its saved retry list. Continue?")) return;
    const label = audience === "all"
      ? "all paid participants"
      : audience === "team"
        ? teamScope === "one"
          ? `team registration ${selectedTeamData?.registrationId}`
          : teamScope === "both"
            ? "all paid Truss and Poster Presentation participants"
            : `all paid ${teamScope === "truss" ? "Truss Combat" : "Poster Presentation"} participants`
        : individualScope === "all"
          ? "all paid individual-registration participants"
          : participantByEmail.get(selectedIndividual)?.name || "the selected participant";
    if (!window.confirm(resume
      ? `Send the saved message to ${batch.remaining.length} remaining recipient(s) only? Previously successful recipients will be skipped. An interrupted request may already have been accepted by the mail server.`
      : skipFirst > 0
        ? `Skip the first ${skipFirst} recipients in the CURRENT selected list and send to ${batch.remaining.length} remaining recipients, starting at #${skipFirst + 1}? This assumes all skipped recipients already received the message and the list order has not changed.`
        : `Send this message individually to ${batch.remaining.length} recipient(s) in ${label}?`)) return;

    setSending(true);
    try {
      batch = await uploadBatch(batch);
      if (batch.sendingEmail) throw new Error(`Delivery to ${batch.sendingEmail} is in progress or needs review. Check the sender's Sent folder before retrying.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save batch online.");
      setSending(false);
      return;
    }
    const targets = [...batch.remaining];
    let sent = 0;
    let failed = 0;
    let consecutiveFailures = 0;
    const errors = new Set<string>();
    for (let index = 0; index < targets.length; index += 1) {
      const email = targets[index];
      setStatus(`Sending ${index + 1} of ${targets.length}…`);
      try {
        const response = await fetch("/api/participant-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password: adminPassword,
            action: "send",
            batchId: batch.id,
            email,
            subject: batch.subject,
            message: batch.message,
            includeSchedule: batch.includeSchedule,
          }),
        });
        const result = await response.json().catch(() => null);
        if (!response.ok) throw new Error(result?.message || `Unable to message ${email}.`);
        sent += 1;
        consecutiveFailures = 0;
        if (!isMessageBatch(result.batch)) throw new Error("Delivery progress could not be confirmed. Load the online batch before retrying.");
        batch = result.batch;
        saveBatch({ ...batch, remaining: [...batch.remaining] });
      } catch (error) {
        failed += 1;
        consecutiveFailures += 1;
        errors.add(error instanceof Error ? error.message : "Unknown delivery error.");
        if (consecutiveFailures >= 3) {
          errors.add("Paused after three consecutive failures. Remaining recipients are saved for retry.");
          break;
        }
      }
    }
    try {
      const latest = await batchRequest({ action: "load-batch", batchId: batch.id });
      if (latest) { batch = latest; saveBatch(latest); }
    } catch { errors.add("Could not refresh online progress. Load the online batch before retrying."); }
    const details = errors.size ? ` ${Array.from(errors).join(" ")}` : "";
    setStatus(`${sent} sent this attempt, ${failed} failed; ${batch.remaining.length} remaining. ${batch.sent} sent in this batch.${details}`);
    setSending(false);
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-800 sm:px-6">
      <section className="mx-auto max-w-5xl rounded-3xl border border-emerald-200 bg-white p-6 shadow-xl sm:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-[#073f37] p-3 text-amber-300"><Mail size={28} /></div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-700">Paid participants only</p>
            <h1 className="mt-1 text-3xl font-extrabold text-[#073f37]">Participant Message Center</h1>
            <p className="mt-2 text-sm text-slate-600">Send an individual email to every paid participant, one paid team, or one participant.</p>
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input type="password" value={adminPassword} onChange={(event) => setAdminPassword(event.target.value)} placeholder="Admin password" className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600" />
          <button type="button" onClick={loadPaidParticipants} disabled={!adminPassword || loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#073f37] px-5 py-3 font-bold text-white disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Database size={18} />} Load paid participants
          </button>
        </div>

        {participants.length > 0 && (
          <>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {(["all", "team", "individual"] as Audience[]).map((option) => (
                <button key={option} type="button" onClick={() => setAudience(option)} className={`rounded-xl border px-4 py-3 text-left font-bold capitalize ${audience === option ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white"}`}>
                  {option === "all" ? "All paid participants" : option === "team" ? "Paid team participants" : "Individual participants"}
                </button>
              ))}
            </div>

            {audience === "team" && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <label className="text-sm font-bold text-amber-900">Paid team recipients</label>
                <select value={teamScope} onChange={(event) => setTeamScope(event.target.value as TeamScope)} className="mt-2 w-full rounded-xl border border-amber-200 bg-white px-4 py-3 outline-none focus:border-amber-600">
                  <option value="truss">All Truss Combat participants</option>
                  <option value="poster">All Poster Presentation participants</option>
                  <option value="both">All Truss and Poster Presentation participants</option>
                  <option value="one">One selected paid team</option>
                </select>
                {teamScope === "one" && (
                  <select value={selectedTeam} onChange={(event) => setSelectedTeam(event.target.value)} className="mt-3 w-full rounded-xl border border-amber-200 bg-white px-4 py-3 outline-none focus:border-amber-600">
                    <option value="">Select team registration…</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        ID {team.registrationId} — {team.teamName || "Unnamed team"} — {team.event} ({team.emails.length} members)
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {audience === "individual" && (
              <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 p-4">
                <label className="text-sm font-bold text-sky-900">Individual-registration recipients</label>
                <select value={individualScope} onChange={(event) => setIndividualScope(event.target.value as IndividualScope)} className="mt-2 w-full rounded-xl border border-sky-200 bg-white px-4 py-3 outline-none focus:border-sky-600">
                  <option value="all">All paid participants from the individual segment</option>
                  <option value="one">One individual participant</option>
                </select>
                {individualScope === "one" && (
                  <div className="mt-4">
                    <label className="flex items-center gap-2 text-sm font-bold text-sky-900"><Search size={17} /> Search by registration ID, name, or email</label>
                    <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search paid individual participant…" className="mt-2 w-full rounded-xl border border-sky-200 bg-white px-4 py-3 outline-none focus:border-sky-600" />
                    {search.trim() && <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-sky-200 bg-white">
                      {searchResults.length ? searchResults.map((participant) => (
                        <button key={participant.normalized_email} type="button" onClick={() => setSelectedIndividual(participant.normalized_email)} className={`flex w-full items-center gap-3 border-b border-sky-100 px-4 py-3 text-left last:border-0 ${selectedIndividual === participant.normalized_email ? "bg-sky-100" : ""}`}>
                          <span className="rounded bg-slate-100 px-2 py-1 text-xs font-bold">ID {participant.registration_id}</span>
                          <span className="min-w-0"><span className="block font-bold">{participant.name}</span><span className="block truncate text-xs text-slate-500">{participant.email}</span></span>
                        </button>
                      )) : <p className="p-4 text-sm text-slate-500">No paid individual participant found.</p>}
                    </div>}
                  </div>
                )}
              </div>
            )}
            <div className="mt-7 grid gap-4">
              <div className="flex items-center justify-between"><label className="font-bold text-slate-700">Email subject</label><span className="text-xs text-slate-500">{subject.length}/200</span></div>
              <input value={subject} maxLength={200} onChange={(event) => setSubject(event.target.value)} placeholder="Important update for Construct Carnival participants" className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600" />
              <div className="flex items-center justify-between"><label className="font-bold text-slate-700">Message</label><span className="text-xs text-slate-500">{message.length}/10,000</span></div>
              <textarea value={message} maxLength={10_000} onChange={(event) => setMessage(event.target.value)} rows={9} placeholder="Write the participant message…" className="resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600" />
            </div>

            <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={includeSchedule} onChange={(event) => setIncludeSchedule(event.target.checked)} />
              Include the full event schedule with this message
            </label>
            <details className="mt-4 rounded-2xl border border-slate-200 p-4">
              <summary className="cursor-pointer font-bold text-slate-700">Preview email</summary>
              <iframe title="Participant email preview" sandbox="" srcDoc={buildParticipantMessageEmail("Participant", subject, message, includeSchedule).html} className="mt-4 h-[720px] w-full rounded-xl border border-slate-200" />
            </details>

            <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 font-bold text-slate-700"><Users size={19} /> {recipientEmails.length} recipient{recipientEmails.length === 1 ? "" : "s"}</div>
              <button type="button" onClick={() => sendMessages()} disabled={sending || !subject.trim() || !message.trim() || recipientEmails.length === 0} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-6 py-3 font-bold text-white hover:bg-amber-700 disabled:opacity-50">
                {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} {sending ? "Sending…" : "Send message"}
              </button>
            </div>
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-bold text-slate-800">Send remaining by recipient number</h3>
              <p className="mt-2 text-sm text-slate-600">Use this for the earlier batch if the first 81 recipients all received the message. This uses the current selected audience order, not verified delivery history.</p>
              <label className="mt-3 block text-sm font-semibold">Skip first recipients
                <input type="number" min={0} max={Math.max(0, recipientEmails.length - 1)} step={1} value={skipFirstCount} disabled={sending} onChange={(event) => setSkipFirstCount(event.target.valueAsNumber || 0)} className="ml-3 w-24 rounded-lg border border-slate-300 p-2" />
              </label>
              {Number.isInteger(skipFirstCount) && skipFirstCount >= 0 && skipFirstCount < recipientEmails.length && <p className="mt-2 text-sm text-slate-700">First recipient: #{skipFirstCount + 1} — {recipientEmails[skipFirstCount]}</p>}
              <button type="button" onClick={() => sendMessages(false, skipFirstCount)} disabled={sending || !adminPassword || !subject.trim() || !message.trim() || !Number.isInteger(skipFirstCount) || skipFirstCount < 0 || skipFirstCount >= recipientEmails.length} className="mt-3 rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white disabled:opacity-50">Send remaining only (skip first {skipFirstCount})</button>
            </div>
            <details className="mt-4 rounded-xl border border-slate-200 p-4">
              <summary className="cursor-pointer font-semibold">Recover a batch sent before retry tracking was added</summary>
              <p className="mt-2 text-sm text-slate-600">Paste the recipient email addresses confirmed in your Sent folder for this announcement. They will be excluded from a new send to the selected audience. A total such as “81 sent” cannot identify which recipients succeeded.</p>
              <textarea aria-label="Previously successful recipient emails" value={previouslySentEmails} onChange={(event) => setPreviouslySentEmails(event.target.value)} rows={4} placeholder="Separate email addresses with spaces, commas, or new lines" className="mt-3 w-full rounded-xl border border-slate-300 p-3" />
            </details>
          </>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={() => syncBatch(false)} disabled={sending || syncing || !adminPassword} className="rounded-xl bg-slate-700 px-5 py-3 font-bold text-white disabled:opacity-50">Load online batch</button>
          {pendingBatch && <button type="button" onClick={() => syncBatch(true)} disabled={sending || syncing || !adminPassword} className="rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white disabled:opacity-50">{syncing ? "Saving / loading…" : "Save this batch online"}</button>}
        </div>
        {pendingBatch && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="mb-2 text-sm font-bold">{onlineBatchId === pendingBatch.id ? "Saved online — available from other browsers" : "Browser copy — save online to share progress"}</p>
          <p className="text-sm text-slate-700">Saved batch: {pendingBatch.subject}. {pendingBatch.sent} sent; {pendingBatch.remaining.length} remaining. Retry uses the saved message and recipient list.</p>
          {pendingBatch.sendingEmail && <div className="mt-3 text-sm"><p>Delivery to {pendingBatch.sendingEmail} is in progress or needs review. If sending has stopped, check the sender’s Sent folder before continuing.</p><div className="mt-2 flex gap-3"><button disabled={sending || syncing} onClick={() => reviewDelivery(true)} className="rounded border p-2">Confirmed sent</button><button disabled={sending || syncing} onClick={() => reviewDelivery(false)} className="rounded border p-2">Confirmed not sent</button></div></div>}
          <button type="button" onClick={() => sendMessages(true)} disabled={sending || syncing || !adminPassword || !pendingBatch.remaining.length || !!pendingBatch.sendingEmail} className="mt-3 rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white disabled:opacity-50">Send remaining only ({pendingBatch.remaining.length})</button>
        </div>}
        {status && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">{status}</p>}
      </section>
    </main>
  );
}
