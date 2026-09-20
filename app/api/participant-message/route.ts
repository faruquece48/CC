import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { sql } from "@vercel/postgres";
import { isMessageBatch } from "@/lib/messageBatch";
import { claimMessageRecipient, finishMessageRecipient, importMessageBatch, loadMessageBatch, validBatchId } from "@/lib/messageBatchStore";
import { formatParticipantName } from "@/lib/participantName";
import { buildParticipantMessageEmail, locationPinBase64 } from "@/lib/participantMessageEmail";

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
  let claimed: { id: string; email: string } | null = null;
  let accepted = false;
  try {
    const body = await request.json();
    if (!authorized(body.password, request)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (body.action === "load-batch") {
      if (body.batchId !== undefined && !validBatchId(body.batchId)) return NextResponse.json({ message: "Invalid batch ID." }, { status: 400 });
      return NextResponse.json({ success: true, batch: await loadMessageBatch(body.batchId) }, { headers: { "Cache-Control": "no-store" } });
    }
    if (body.action === "save-batch") {
      if (!isMessageBatch(body.batch) || !validBatchId(body.batch.id)) return NextResponse.json({ message: "Invalid saved batch." }, { status: 400 });
      return NextResponse.json({ success: true, batch: await importMessageBatch(body.batch) }, { headers: { "Cache-Control": "no-store" } });
    }
    if (body.action === "resolve-batch") {
      if (!validBatchId(body.batchId) || typeof body.email !== "string" || typeof body.sent !== "boolean") return NextResponse.json({ message: "Invalid delivery review." }, { status: 400 });
      const batch = await loadMessageBatch(body.batchId);
      if (!batch || batch.sendingEmail !== body.email) return NextResponse.json({ message: "Reload the batch before reviewing this delivery." }, { status: 409 });
      try {
        return NextResponse.json({ success: true, batch: await finishMessageRecipient(body.batchId, body.email, body.sent, true) });
      } catch {
        return NextResponse.json({ message: "Delivery is still in progress or was already reviewed. Wait five minutes, then reload the online batch." }, { status: 409 });
      }
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

    if (!validBatchId(body.batchId)) return NextResponse.json({ message: "Save this batch online before sending. Refresh the message page if necessary." }, { status: 400 });
    const batch = await loadMessageBatch(body.batchId);
    if (!batch) return NextResponse.json({ message: "Saved batch not found." }, { status: 404 });
    const normalizedEmail = normalizeEmail(body.email);
    const subject = batch.subject;
    const message = batch.message;
    if (!batch.remaining.includes(normalizedEmail)) return NextResponse.json({ success: true, batch, message: "Recipient is no longer pending." });
    if (!normalizedEmail || !subject || !message || subject.length > 200 || message.length > 10_000) {
      return NextResponse.json({ success: false, message: "A valid recipient, subject, and message are required." }, { status: 400 });
    }

    const participantsResult = await paidParticipants();
    const participant = participantsResult.rows.find((row) => row.normalized_email === normalizedEmail);
    if (!participant) {
      return NextResponse.json({ success: false, message: "This email does not belong to a paid participant." }, { status: 404 });
    }

    const participantName = formatParticipantName(String(participant.name || "Participant"));
    const emailContent = buildParticipantMessageEmail(participantName, subject, message, batch.includeSchedule, "cid:location-pin");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });
    if (!await claimMessageRecipient(body.batchId, normalizedEmail)) return NextResponse.json({ message: "This batch has a delivery in progress or awaiting review. Load the online batch before retrying." }, { status: 409 });
    claimed = { id: body.batchId, email: normalizedEmail };
    await transporter.sendMail({
      from: `"Construct Carnival" <${process.env.GMAIL_USER}>`,
      to: participant.email,
      subject,
      ...emailContent,
      attachments: batch.includeSchedule ? [{
        filename: "location-pin.png",
        content: Buffer.from(locationPinBase64, "base64"),
        contentType: "image/png",
        cid: "location-pin",
      }] : [],
    });
    accepted = true;
    const updatedBatch = await finishMessageRecipient(body.batchId, normalizedEmail, true);
    return NextResponse.json({ success: true, batch: updatedBatch, message: `Message sent to ${participant.email}.` });
  } catch (error) {
    console.error("PARTICIPANT MESSAGE ERROR:", error);
    const failure = error as { code?: string; responseCode?: number; response?: string };
    // Ambiguous deliveries stay locked until reviewed to avoid duplicate emails.
    if (claimed && !accepted && (failure.code === "EAUTH" || (failure.responseCode || 0) >= 400)) {
      await finishMessageRecipient(claimed.id, claimed.email, false).catch(() => undefined);
    }
    let message = "Unable to process the participant message. Check the server logs for database or email-service errors.";
    if (/daily|quota|sending limit|rate limit|too many/i.test(failure.response || "")) {
      message = "The email provider reports a sending limit. Wait for the limit to reset before retrying remaining recipients.";
    } else if (failure.code === "EAUTH") {
      message = "The email provider rejected authentication. Check the configured sender credentials before retrying.";
    } else if (["ETIMEDOUT", "ECONNECTION", "ESOCKET", "ECONNRESET"].includes(failure.code || "")) {
      message = "The email connection failed or timed out. Check the sender's Sent folder before retrying: delivery may have completed without confirmation.";
    } else if (failure.responseCode) {
      message = `The email provider rejected this request (SMTP ${failure.responseCode}). Check server logs for the provider's reason before retrying.`;
    }
    return NextResponse.json({
      success: false,
      message,
    }, { status: 500 });
  }
}
