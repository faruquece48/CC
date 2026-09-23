import nodemailer from "nodemailer";
import { sql } from "@vercel/postgres";
import { formatCertificateEvents } from "@/lib/participationCertificate";
import { createParticipationCertificatePdf } from "@/lib/participationCertificatePdf";
import { formatParticipantName } from "@/lib/participantName";

const escapeHtml = (value: unknown) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

export async function sendParticipationCertificate(participant: {
  registrationId: number;
  name: string;
  email: string;
  events: string[];
}, options: { forceResend?: boolean } = {}) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw Object.assign(new Error("Gmail configuration is missing."), { code: "ECONFIG" });
  }

  await sql`
    CREATE TABLE IF NOT EXISTS eventCertificateEmailLog (
      normalized_email TEXT NOT NULL,
      event TEXT NOT NULL,
      registration_id BIGINT NOT NULL,
      participant_name TEXT NOT NULL,
      recipient TEXT NOT NULL,
      certificate_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'sending',
      sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (normalized_email, event)
    )
  `;

  const normalizedEmail = participant.email.trim().toLowerCase().replace(/\s+/g, "");
  const event = String(participant.events[0] || "").trim().toLowerCase();
  if (!event) throw new Error("An event is required for an event certificate.");
  const { createCertificateId } = await import("@/lib/participationCertificate");
  const certificateId = createCertificateId(participant.name, participant.email);
  const claim = await sql`
    INSERT INTO eventCertificateEmailLog (
      normalized_email, event, registration_id, participant_name, recipient, certificate_id, status, sent_at
    ) VALUES (
      ${normalizedEmail}, ${event}, ${participant.registrationId}, ${participant.name}, ${participant.email}, ${certificateId}, 'sending', NOW()
    )
    ON CONFLICT (normalized_email, event) DO UPDATE
    SET status = 'sending', sent_at = NOW()
    WHERE (eventCertificateEmailLog.status = 'sent' AND ${Boolean(options.forceResend)})
       OR (eventCertificateEmailLog.status <> 'sent'
         AND eventCertificateEmailLog.sent_at < NOW() - INTERVAL '30 seconds')
    RETURNING normalized_email
  `;
  if (claim.rowCount === 0) return { sent: false, alreadySent: true, certificateId };

  try {
    const certificate = await createParticipationCertificatePdf(participant);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });
    const events = formatCertificateEvents(participant.events);
    const participantName = formatParticipantName(participant.name);

    await transporter.sendMail({
      from: `"Construct Carnival" <${process.env.GMAIL_USER}>`,
      to: participant.email,
      subject: `Certificate of Participation — ${events}`,
      attachments: [{
        filename: `${participant.registrationId}-${event}-certificate.pdf`,
        content: certificate,
        contentType: "application/pdf",
      }],
      text: `Dear ${participantName},\n\nThank you for participating in ${events}. Your Certificate of Participation is attached.\n\nBest regards,\nConstruct Carnival 2.0`,
      html: `<div style="margin:0 auto;max-width:640px;font-family:Arial,sans-serif;color:#1f2937;font-size:15px;line-height:1.7"><p><strong>Dear ${escapeHtml(participantName)},</strong></p><p>Thank you for your enthusiastic participation in <strong>${escapeHtml(events)}</strong>. Your official Certificate of Participation is attached to this email.</p><p style="margin-top:28px"><strong>Best regards,</strong><br>Construct Carnival 2.0<br>Department of BECM, RUET</p></div>`,
    });

    await sql`UPDATE eventCertificateEmailLog SET status = 'sent', sent_at = NOW() WHERE normalized_email = ${normalizedEmail} AND event = ${event}`;
    return { sent: true, alreadySent: false, certificateId };
  } catch (error) {
    await sql`DELETE FROM eventCertificateEmailLog WHERE normalized_email = ${normalizedEmail} AND event = ${event} AND status = 'sending'`;
    throw error;
  }
}
