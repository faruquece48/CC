"use client";

import { useEffect, useState } from "react";
import TrussPrintPreview, { PublicTrussSchedule, PublicTrussTeam } from "@/components/trussPrintPreview";
import IndividualEventPrintPreview, { IndividualEventKey, PublicIndividualParticipant } from "@/components/individualEventPrintPreview";

const scheduleDataVersion = "cancelled-registration-filter-v1";

type TrussPageData = PublicTrussSchedule & { individualEvents: Record<IndividualEventKey, PublicIndividualParticipant[]> };

export default function TrussPage() {
  const [schedule, setSchedule] = useState<TrussPageData | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setSchedule(null);
    fetch(`/api/truss-schedule?payment=paid&v=${scheduleDataVersion}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Unable to load schedule.");
        const teams = [...(result.groups || []).flat(), ...(result.unassigned || [])];
        if (teams.some((team: PublicTrussTeam) => team.participants.some((member) => typeof member.email !== "string"))) {
          throw new Error("The schedule response is missing email data. Please refresh after updating the server.");
        }
        if (!controller.signal.aborted) setSchedule(result);
      })
      .catch((cause) => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Unable to load schedule."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [refresh, scheduleDataVersion]);

  return <main className="min-h-screen bg-[#f3f7f6] px-4 py-10 text-slate-800 sm:px-8">
    <div className="mx-auto max-w-7xl space-y-6">
      {schedule && <>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><TrussPrintPreview schedule={schedule} /><TrussPrintPreview schedule={schedule} detailed /></div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {(["cad", "mechamind", "management"] as IndividualEventKey[]).map((event) => <IndividualEventPrintPreview key={event} event={event} participants={schedule.individualEvents?.[event] || []} />)}
        </div>
      </>}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
      {loading && <p role="status" className="rounded-xl bg-white p-6">Loading Truss schedule...</p>}
      {error && <button onClick={() => setRefresh((value) => value + 1)} className="rounded-lg bg-[#073f37] px-5 py-3 text-white">Try again</button>}
    </div>
  </main>;
}
