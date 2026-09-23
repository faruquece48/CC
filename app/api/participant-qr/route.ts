import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import QRCode from "qrcode";
import sharp from "sharp";
import { ambassadors } from "@/lib/ambassadors";
import { sql } from "@vercel/postgres";
import { formatParticipantName } from "@/lib/participantName";
import { createParticipantQrToken, type QrPurpose } from "@/lib/participantQr";
import { participantQrEmailHtml, participantQrEmailSubject, participantQrEmailText } from "@/lib/participantQrEmail";

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

const ambassadorEmails = new Set(ambassadors.map((ambassador) => normalizeEmail(ambassador.email)));
const isCampusAmbassador = (email: unknown) => ambassadorEmails.has(normalizeEmail(email));

async function individualParticipants() {
  return sql`
    WITH paid_people AS (
      SELECT single_data.registration_id, single_data.name, single_data.email,
        COALESCE(single_data.phonenumber, '') AS phonenumber,
        LOWER(REGEXP_REPLACE(TRIM(single_data.email), '\s+', '', 'g')) AS normalized_email,
        single_data.created_at
      FROM singleRegistrationData AS single_data
      JOIN registrationData AS master ON master.id = single_data.registration_id
      WHERE master.ispaid = TRUE AND TRIM(single_data.email) <> ''
      UNION ALL
      SELECT team_data.registration_id, member->>'name', member->>'email',
        COALESCE(member->>'phoneNumber', '') AS phonenumber,
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
      (ARRAY_AGG(email ORDER BY created_at DESC, registration_id DESC))[1] AS email,
      (ARRAY_AGG(phonenumber ORDER BY created_at DESC, registration_id DESC))[1] AS phonenumber
    FROM paid_people
    GROUP BY normalized_email
    ORDER BY registration_id
  `;
}

function qrValue(registrationId: number | string, email: string, purpose: QrPurpose) {
  return createParticipantQrToken({ registrationId, email, purpose });
}

async function qrPng(value: string, registrationId: number | string, purpose: QrPurpose, ambassador: boolean) {
  const qr = await QRCode.toBuffer(value, { width: 360, margin: 4, errorCorrectionLevel: "M" });
  if (!ambassador) return qr;
  const purposeLabel = purpose === "kit" ? "KIT COLLECTION" : "LUNCH COLLECTION";
  const label = Buffer.from(`<svg width="420" height="82" xmlns="http://www.w3.org/2000/svg"><rect width="420" height="82" rx="10" fill="#073f37"/><text x="210" y="25" text-anchor="middle" fill="#f5d77a" font-family="Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="1.5">${purposeLabel}</text><text x="210" y="53" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="17" font-weight="700">Registration ${registrationId} | Campus Ambassador</text><text x="210" y="72" text-anchor="middle" fill="#d1fae5" font-family="Arial, sans-serif" font-size="10">Construct Carnival 2.0</text></svg>`);
  return sharp({ create: { width: 420, height: 480, channels: 4, background: "#ffffff" } })
    .composite([{ input: qr, left: 30, top: 8 }, { input: label, left: 0, top: 390 }])
    .png()
    .toBuffer();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!authorized(body.password, request)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (body.action === "list") {
      const result = await individualParticipants();
      const registeredEmails = new Set(result.rows.map((row) => normalizeEmail(row.email)));
      const registered = result.rows.map((row) => ({ ...row, is_ambassador: isCampusAmbassador(row.email), recipient_group: "participant" }));
      const unregisteredAmbassadors = ambassadors
        .filter((ambassador) => !registeredEmails.has(normalizeEmail(ambassador.email)))
        .map((ambassador) => ({
          registration_id: ambassador.code,
          name: ambassador.name,
          email: ambassador.email,
          normalized_email: normalizeEmail(ambassador.email),
          is_ambassador: true,
          recipient_group: "ambassador",
        }));
      return NextResponse.json({ success: true, participants: [...registered, ...unregisteredAmbassadors] }, {
        headers: { "Cache-Control": "no-store" },
      });
    }

    const rawRegistrationId = String(body.registrationId || "").trim().toUpperCase();
    const ambassadorRecord = /^CC\d{2}$/.test(rawRegistrationId)
      ? ambassadors.find((item) => item.code === rawRegistrationId && normalizeEmail(item.email) === normalizeEmail(body.email))
      : undefined;
    const registrationId: number | string = ambassadorRecord ? ambassadorRecord.code : Number(body.registrationId);
    const participants = await individualParticipants();
    const participant = ambassadorRecord
      ? { registration_id: ambassadorRecord.code, name: ambassadorRecord.name, email: ambassadorRecord.email, phonenumber: "", normalized_email: normalizeEmail(ambassadorRecord.email) }
      : participants.rows.find((row) =>
          Number(row.registration_id) === registrationId
          && (!body.email || row.normalized_email === normalizeEmail(body.email)));
    if (!participant) {
      return NextResponse.json({ success: false, message: "Paid participant not found." }, { status: 404 });
    }

    const ambassador = Boolean(ambassadorRecord) || isCampusAmbassador(participant.email);
    const kitToken = qrValue(registrationId, participant.normalized_email, "kit");
    const lunchToken = qrValue(registrationId, participant.normalized_email, "lunch");
    const [kitBuffer, lunchBuffer] = await Promise.all([
      qrPng(kitToken, registrationId, "kit", ambassador),
      qrPng(lunchToken, registrationId, "lunch", ambassador),
    ]);

    const name = formatParticipantName(String(participant.name || "Participant"));
    const emailData = { name, registrationId, email: String(participant.email), phone: String(participant.phonenumber || "Not provided"), ambassador };
    if (body.action === "preview-email") {
      return NextResponse.json({ success: true, subject: participantQrEmailSubject, html: participantQrEmailHtml(emailData) }, { headers: { "Cache-Control": "no-store" } });
    }

    if (body.action === "generate") {
      return NextResponse.json({
        success: true,
        kitQr: `data:image/png;base64,${kitBuffer.toString("base64")}`,
        lunchQr: `data:image/png;base64,${lunchBuffer.toString("base64")}`,
        kitToken,
        lunchToken,
        isAmbassador: ambassador,
      }, { headers: { "Cache-Control": "no-store" } });
    }

    if (body.action !== "send") {
      return NextResponse.json({ success: false, message: "Invalid action." }, { status: 400 });
    }
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json({ success: false, message: "Email service is not configured." }, { status: 503 });
    }


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
      subject: participantQrEmailSubject,
      text: participantQrEmailText(emailData),
      html: participantQrEmailHtml(emailData),
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
