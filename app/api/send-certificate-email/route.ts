import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { sendParticipationCertificate } from "@/lib/certificateEmail";

function authorized(password: unknown) {
  const provided = Buffer.from(typeof password === "string" ? password : "");
  const expected = Buffer.from(process.env.ADMIN_PASSWORD || "");
  return Boolean(process.env.ADMIN_PASSWORD) && provided.length === expected.length && timingSafeEqual(provided, expected);
}

export async function POST(request: Request) {
  const { password, email } = await request.json();
  if (!authorized(password)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!normalizedEmail) {
    return NextResponse.json({ success: false, message: "Select a participant." }, { status: 400 });
  }

  const result = await sql`
    WITH participant_events AS (
      SELECT single_data.registration_id, single_data.name, single_data.email,
        LOWER(TRIM(single_data.email)) AS normalized_email, UNNEST(single_data.events) AS event,
        single_data.created_at
      FROM singleRegistrationData AS single_data
      UNION ALL
      SELECT team_data.registration_id, member->>'name', member->>'email',
        LOWER(TRIM(member->>'email')), team_data.event, team_data.created_at
      FROM teamRegistrationData AS team_data
      CROSS JOIN LATERAL JSONB_ARRAY_ELEMENTS(team_data.members) AS member
    )
    SELECT
      (ARRAY_AGG(registration_id ORDER BY created_at DESC, registration_id DESC))[1] AS registration_id,
      (ARRAY_AGG(name ORDER BY created_at DESC, registration_id DESC))[1] AS name,
      (ARRAY_AGG(email ORDER BY created_at DESC, registration_id DESC))[1] AS email,
      ARRAY_AGG(DISTINCT event ORDER BY event) AS events
    FROM participant_events
    WHERE normalized_email = ${normalizedEmail}
    GROUP BY normalized_email
  `;
  const participant = result.rows[0];
  if (!participant) {
    return NextResponse.json({ success: false, message: "Participant not found." }, { status: 404 });
  }

  try {
    const delivery = await sendParticipationCertificate({
      registrationId: Number(participant.registration_id),
      name: String(participant.name),
      email: String(participant.email),
      events: participant.events as string[],
    });
    return NextResponse.json({
      success: delivery.sent || delivery.alreadySent,
      alreadySent: delivery.alreadySent,
      message: delivery.alreadySent
        ? "This participant already received a certificate."
        : `Certificate accepted for delivery to ${participant.email}.`,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    const message = error?.code === "ECONFIG"
      ? "GMAIL_USER or GMAIL_APP_PASSWORD is missing."
      : error?.code === "EAUTH"
        ? "Gmail authentication failed. Check the configured account and App Password."
        : "The certificate could not be generated or sent. Check the local server log.";
    console.error("CERTIFICATE EMAIL ERROR:", error);
    return NextResponse.json({ success: false, message }, { status: 503 });
  }
}
