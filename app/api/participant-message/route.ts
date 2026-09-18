import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { sql } from "@vercel/postgres";
import { formatParticipantName } from "@/lib/participantName";

function authorized(password: unknown, request: Request) {
  const hostname = new URL(request.url).hostname;
  if (process.env.NODE_ENV === "development"
    && (hostname === "localhost" || hostname === "127.0.0.1")
    && password === "local-development") return true;
  const normalize = (value: string) => value.replace(/\s+/g, "");
  const provided = Buffer.from(normalize(typeof password === "string" ? password : ""));
  const expected = Buffer.from(normalize(process.env.ADMIN_PASSWORD || ""));
  return Boolean(process.env.ADMIN_PASSWORD)
    && provided.length === expected.length
    && timingSafeEqual(provided, expected);
}

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase().replace(/\s+/g, "") : "";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[character] || character);
}

async function paidParticipants() {
  return sql`
    WITH paid_people AS (
      SELECT single_data.registration_id, single_data.name, single_data.email,
        LOWER(REGEXP_REPLACE(TRIM(single_data.email), '\s+', '', 'g')) AS normalized_email,
        single_data.created_at
      FROM singleRegistrationData AS single_data
      JOIN registrationData AS master ON master.id = single_data.registration_id
      WHERE master.ispaid = TRUE
      UNION ALL
      SELECT team_data.registration_id, member->>'name', member->>'email',
        LOWER(REGEXP_REPLACE(TRIM(member->>'email'), '\s+', '', 'g')),
        team_data.created_at
      FROM teamRegistrationData AS team_data
      JOIN registrationData AS master ON master.id = team_data.registration_id
      CROSS JOIN LATERAL JSONB_ARRAY_ELEMENTS(team_data.members) AS member
      WHERE master.ispaid = TRUE
    )
    SELECT normalized_email,
      (ARRAY_AGG(registration_id ORDER BY created_at DESC, registration_id DESC))[1] AS registration_id,
      (ARRAY_AGG(name ORDER BY created_at DESC, registration_id DESC))[1] AS name,
      (ARRAY_AGG(email ORDER BY created_at DESC, registration_id DESC))[1] AS email
    FROM paid_people
    WHERE normalized_email IS NOT NULL AND normalized_email <> ''
    GROUP BY normalized_email
    ORDER BY name, email
  `;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!authorized(body.password, request)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (body.action === "list") {
      const [participantsResult, teamsResult, individualResult] = await Promise.all([
        paidParticipants(),
        sql`
          SELECT team_data.id, team_data.registration_id, team_data.teamname, team_data.event, team_data.members
          FROM teamRegistrationData AS team_data
          JOIN registrationData AS master ON master.id = team_data.registration_id
          WHERE master.ispaid = TRUE
          ORDER BY team_data.registration_id, team_data.id
        `,        sql`
          SELECT DISTINCT LOWER(REGEXP_REPLACE(TRIM(single_data.email), '\s+', '', 'g')) AS normalized_email
          FROM singleRegistrationData AS single_data
          JOIN registrationData AS master ON master.id = single_data.registration_id
          WHERE master.ispaid = TRUE AND TRIM(single_data.email) <> ''
          ORDER BY normalized_email
        `,
      ]);
      const teams = teamsResult.rows.map((team) => ({
        id: team.id,
        registrationId: team.registration_id,
        teamName: team.teamname,
        event: team.event,
        emails: (Array.isArray(team.members) ? team.members : [])
          .map((member: { email?: unknown }) => normalizeEmail(member.email))
          .filter(Boolean),
      }));
      return NextResponse.json({
        success: true,
        participants: participantsResult.rows,
        teams,
        individualEmails: individualResult.rows.map((row) => row.normalized_email),
      }, {
        headers: { "Cache-Control": "no-store" },
      });
    }

    if (body.action !== "send") {
      return NextResponse.json({ success: false, message: "Invalid action." }, { status: 400 });
    }
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json({ success: false, message: "Email service is not configured." }, { status: 503 });
    }

    const normalizedEmail = normalizeEmail(body.email);
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!normalizedEmail || !subject || !message || subject.length > 200 || message.length > 10_000) {
      return NextResponse.json({ success: false, message: "A valid recipient, subject, and message are required." }, { status: 400 });
    }

    const participantsResult = await paidParticipants();
    const participant = participantsResult.rows.find((row) => row.normalized_email === normalizedEmail);
    if (!participant) {
      return NextResponse.json({ success: false, message: "This email does not belong to a paid participant." }, { status: 404 });
    }

    const participantName = formatParticipantName(String(participant.name || "Participant"));
    const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br>");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });
    await transporter.sendMail({
      from: `"Construct Carnival" <${process.env.GMAIL_USER}>`,
      to: participant.email,
      subject,
      text: `Dear ${participantName},\n\n${message}\n\nBest regards,\nConstruct Carnival 2.0`,
      html: `<div style="margin:0 auto;max-width:640px;font-family:Arial,sans-serif;color:#1f2937;font-size:15px;line-height:1.7"><p><strong>Dear ${escapeHtml(participantName)},</strong></p><p>${safeMessage}</p><p style="margin-top:28px"><strong>Best regards,</strong><br>Construct Carnival 2.0<br>Department of BECM, RUET</p></div>`,
    });
    return NextResponse.json({ success: true, message: `Message sent to ${participant.email}.` });
  } catch (error) {
    console.error("PARTICIPANT MESSAGE ERROR:", error);
    return NextResponse.json({
      success: false,
      message: process.env.NODE_ENV === "development" ? `Unable to process message: ${String(error)}` : "Unable to process the participant message.",
    }, { status: 500 });
  }
}