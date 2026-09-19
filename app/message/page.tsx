"use client";

import { Database, Loader2, Mail, Search, Send, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { formatParticipantName } from "@/lib/participantName";
import { buildParticipantMessageEmail } from "@/lib/participantMessageEmail";

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
  const [subject, setSubject] = useState("Important Schedule Update — Construct Carnival 2.0 Rescheduled");
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
  const [status, setStatus] = useState("");

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

  const sendMessages = async () => {
    if (!subject.trim() || !message.trim() || recipientEmails.length === 0 || sending) return;
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
    if (!window.confirm(`Send this message individually to ${recipientEmails.length} recipient(s) in ${label}?`)) return;

    setSending(true);
    let sent = 0;
    let failed = 0;
    const errors = new Set<string>();
    for (let index = 0; index < recipientEmails.length; index += 1) {
      const email = recipientEmails[index];
      setStatus(`Sending ${index + 1} of ${recipientEmails.length}…`);
      try {
        const response = await fetch("/api/participant-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password: adminPassword,
            action: "send",
            email,
            subject: subject.trim(),
            message: message.trim(),
            includeSchedule,
          }),
        });
        const result = await response.json().catch(() => null);
        if (!response.ok) throw new Error(result?.message || `Unable to message ${email}.`);
        sent += 1;
      } catch (error) {
        failed += 1;
        errors.add(error instanceof Error ? error.message : "Unknown delivery error.");
      }
    }
    const details = errors.size ? ` ${Array.from(errors).join(" ")}` : "";
    setStatus(`${sent} sent, ${failed} failed.${details}`);
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
              <button type="button" onClick={sendMessages} disabled={sending || !subject.trim() || !message.trim() || recipientEmails.length === 0} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-6 py-3 font-bold text-white hover:bg-amber-700 disabled:opacity-50">
                {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} {sending ? "Sending…" : "Send message"}
              </button>
            </div>
          </>
        )}

        {status && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">{status}</p>}
      </section>
    </main>
  );
}
