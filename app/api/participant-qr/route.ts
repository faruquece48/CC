import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import QRCode from "qrcode";
import { sql } from "@vercel/postgres";
import { formatParticipantName } from "@/lib/participantName";
import { createParticipantQrToken, type QrPurpose } from "@/lib/participantQr";

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

async function individualParticipants() {
  return sql`
    WITH paid_people AS (
      SELECT single_data.registration_id, single_data.name, single_data.email,
        LOWER(REGEXP_REPLACE(TRIM(single_data.email), '\s+', '', 'g')) AS normalized_email,
        single_data.created_at
      FROM singleRegistrationData AS single_data
      JOIN registrationData AS master ON master.id = single_data.registration_id
      WHERE master.ispaid = TRUE AND TRIM(single_data.email) <> ''
      UNION ALL
      SELECT team_data.registration_id, member->>'name', member->>'email',
        LOWER(REGEXP_REPLACE(TRIM(member->>'email'), '\s+', '', 'g')),
        team_data.created_at
      FROM teamRegistrationData AS team_data
      JOIN registrationData AS master ON master.id = team_data.registration_id
      CROSS JOIN LATERAL JSONB_ARRAY_ELEMENTS(team_data.members) AS member
      WHERE master.ispaid = TRUE AND TRIM(member->>'email') <> ''
    )
    SELECT normalized_email,
      (ARRAY_AGG(registration_id ORDER BY created_at DESC, registration_id DESC))[1] AS registration_id,
      (ARRAY_AGG(name ORDER BY created_at DESC, registration_id DESC))[1] AS name,
      (ARRAY_AGG(email ORDER BY created_at DESC, registration_id DESC))[1] AS email
    FROM paid_people
    GROUP BY normalized_email
    ORDER BY registration_id
  `;
}

function qrValue(registrationId: number, email: string, purpose: QrPurpose) {
  return createParticipantQrToken({ registrationId, email, purpose });
}

async function qrPng(value: string) {
  return QRCode.toBuffer(value, { width: 360, margin: 4, errorCorrectionLevel: "M" });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!authorized(body.password, request)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (body.action === "list") {
      const result = await individualParticipants();
      return NextResponse.json({ success: true, participants: result.rows }, {
        headers: { "Cache-Control": "no-store" },
      });
    }

    const registrationId = Number(body.registrationId);
    const participants = await individualParticipants();
    const participant = participants.rows.find((row) =>
      Number(row.registration_id) === registrationId
      && (!body.email || row.normalized_email === normalizeEmail(body.email)));
    if (!participant) {
      return NextResponse.json({ success: false, message: "Paid participant not found." }, { status: 404 });
    }

    const kitToken = qrValue(registrationId, participant.normalized_email, "kit");
    const lunchToken = qrValue(registrationId, participant.normalized_email, "lunch");
    const [kitBuffer, lunchBuffer] = await Promise.all([qrPng(kitToken), qrPng(lunchToken)]);

    if (body.action === "generate") {
      return NextResponse.json({
        success: true,
        kitQr: `data:image/png;base64,${kitBuffer.toString("base64")}`,
        lunchQr: `data:image/png;base64,${lunchBuffer.toString("base64")}`,
        kitToken,
        lunchToken,
      }, { headers: { "Cache-Control": "no-store" } });
    }

    if (body.action !== "send") {
      return NextResponse.json({ success: false, message: "Invalid action." }, { status: 400 });
    }
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json({ success: false, message: "Email service is not configured." }, { status: 503 });
    }

    const name = formatParticipantName(String(participant.name || "Participant"));
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
      subject: "Your Kit Collection and Lunch QR Codes — Construct Carnival 2.0",
      text: `Dear ${name},\n\nYour unique QR codes for kit collection and lunch are attached. Please present the correct code at each collection point. Each code is intended only for registration ID ${registrationId}. Do not share, forward, or allow anyone else to use these codes. Each code works only once, and sharing it may prevent you from collecting your own kit or lunch.\n\nBest regards,\nConstruct Carnival 2.0`,
      html: `<div style="margin:0 auto;max-width:640px;font-family:Arial,sans-serif;color:#1f2937;line-height:1.7"><p><strong>Dear ${name},</strong></p><p>Your unique QR codes for <strong>kit collection</strong> and <strong>lunch</strong> are attached. Please present the correct code at each collection point.</p><p><strong>Registration ID:</strong> ${registrationId}</p><p style="padding:12px;border-radius:8px;background:#fff3cd;color:#7c4a03"><strong>Important:</strong> Do not share or forward these QR codes to anyone. Each code works only once. If another person uses your code first, you may not be able to collect your own kit or lunch.</p><p><strong>Best regards,</strong><br>Construct Carnival 2.0<br>Department of BECM, RUET</p></div>`,
      attachments: [
        { filename: `${registrationId}-kit-qr.png`, content: kitBuffer, contentType: "image/png" },
        { filename: `${registrationId}-lunch-qr.png`, content: lunchBuffer, contentType: "image/png" },
      ],
    });
    return NextResponse.json({ success: true, message: `QR codes sent to ${participant.email}.` });
  } catch (error) {
    console.error("PARTICIPANT QR ERROR:", error);
    return NextResponse.json({
      success: false,
      message: process.env.NODE_ENV === "development" ? `Unable to process QR codes: ${String(error)}` : "Unable to process participant QR codes.",
    }, { status: 500 });
  }
}