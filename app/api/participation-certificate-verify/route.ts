import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { createCertificateId, formatCertificateEvents } from "@/lib/participationCertificate";
import { formatParticipantName } from "@/lib/participantName";
import { verifyParticipationCertificateToken } from "@/lib/participationCertificateVerification";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  const claim = verifyParticipationCertificateToken(token);
  if (!claim) return NextResponse.json({ valid: false, message: "This certificate could not be verified." }, { status: 400 });
  const result = await sql`
    WITH participant_events AS (
      SELECT single_data.name, single_data.email, LOWER(TRIM(event_name)) AS event
      FROM singleRegistrationData AS single_data
      CROSS JOIN LATERAL UNNEST(single_data.events) AS event_name
      WHERE single_data.registration_id = ${claim.registrationId}
      UNION ALL
      SELECT member->>'name' AS name, member->>'email' AS email, LOWER(TRIM(team_data.event)) AS event
      FROM teamRegistrationData AS team_data
      CROSS JOIN LATERAL JSONB_ARRAY_ELEMENTS(team_data.members) AS member
      WHERE team_data.registration_id = ${claim.registrationId}
    )
    SELECT name, email, ARRAY_AGG(DISTINCT event ORDER BY event) AS events
    FROM participant_events WHERE email IS NOT NULL AND TRIM(email) <> '' GROUP BY name, email
  `;
  const participant = result.rows.find((row) => createCertificateId(String(row.name), String(row.email)) === claim.certificateId);
  if (!participant) return NextResponse.json({ valid: false, message: "No matching official participant certificate was found." }, { status: 404 });
  return NextResponse.json({ valid: true, certificate: {
    type: "Certificate of Participation", registrationId: claim.registrationId,
    name: formatParticipantName(String(participant.name)), event: formatCertificateEvents(participant.events as string[]),
  } }, { headers: { "Cache-Control": "no-store" } });
}
