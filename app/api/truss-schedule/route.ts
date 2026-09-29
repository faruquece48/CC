import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { buildTrussSchedule, SingleRegistration, TeamRegistration } from "@/lib/trussSchedule";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const paidOnly = new URL(request.url).searchParams.get("payment") !== "all";
    const [single, team] = await Promise.all([
      sql`SELECT s.registration_id, s.name, s.email, s.events, r.ispaid FROM singleRegistrationData s
          JOIN registrationData r ON r.id = s.registration_id
          WHERE NOT EXISTS (SELECT 1 FROM cancelledRegistrationData c WHERE c.registration_id = s.registration_id)`,
      sql`SELECT t.id, t.registration_id, t.teamname, t.event, t.members, r.ispaid
          FROM teamRegistrationData t JOIN registrationData r ON r.id = t.registration_id
          WHERE NOT EXISTS (SELECT 1 FROM cancelledRegistrationData c WHERE c.registration_id = t.registration_id)`,
    ]);
    const schedule = buildTrussSchedule(single.rows as SingleRegistration[], team.rows as TeamRegistration[], paidOnly);
    const individualEvents = Object.fromEntries(["cad", "mechamind", "management"].map((event) => [
      event,
      single.rows.filter((row) => (!paidOnly || row.ispaid) && (row.events || []).includes(event)).map((row) => ({
        registration_id: row.registration_id, name: row.name,
      })).sort((a, b) => Number(a.registration_id) - Number(b.registration_id)),
    ]));
    // Publish the fields needed by the schedule and full-table PDF.
    const publish = (teams: typeof schedule.groups[number]) => teams.map((team) => ({
      id: team.id, registration_id: team.registration_id, teamname: team.teamname,
      participants: team.participants.map((member) => ({ name: member.name, email: member.email, events: member.events })),
    }));
    return NextResponse.json({ groups: schedule.groups.map(publish), unassigned: publish(schedule.unassigned), total: schedule.total, individualEvents },
      { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ message: "Unable to load the Truss schedule. Please try again." }, { status: 500 });
  }
}
