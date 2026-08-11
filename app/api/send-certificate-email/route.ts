import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { sendParticipationCertificate } from "@/lib/certificateEmail";

function authorized(password: unknown, request: Request) {
  const hostname = new URL(request.url).hostname;
  if (process.env.NODE_ENV === "development"
    && (hostname === "localhost" || hostname === "127.0.0.1")
    && password === "local-development") return true;
  const normalize = (value: string) => value.replace(/\s+/g, "");
  const provided = Buffer.from(normalize(typeof password === "string" ? password : ""));
  const expected = Buffer.from(normalize(process.env.ADMIN_PASSWORD || ""));
  return Boolean(process.env.ADMIN_PASSWORD) && provided.length === expected.length && timingSafeEqual(provided, expected);
}

export async function POST(request: Request) {
  const { password, email, forceResend } = await request.json();
  if (!authorized(password, request)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase().replace(/\s+/g, "") : "";
  if (!normalizedEmail) {
    return NextResponse.json({ success: false, message: "Select a participant." }, { status: 400 });
  }

  const result = await sql`
    WITH participant_events AS (
      SELECT single_data.registration_id, single_data.name, single_data.email,
        LOWER(REGEXP_REPLACE(TRIM(single_data.email), '\s+', '', 'g')) AS normalized_email,
        LOWER(TRIM(individual_event.event)) AS event,
        single_data.created_at
      FROM singleRegistrationData AS single_data
      CROSS JOIN LATERAL UNNEST(single_data.events) AS individual_event(event)
      UNION ALL
      SELECT team_data.registration_id, member->>'name', member->>'email',
        LOWER(REGEXP_REPLACE(TRIM(member->>'email'), '\s+', '', 'g')),
        LOWER(TRIM(team_data.event)), team_data.created_at
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
    }, { forceResend: forceResend === true });
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
