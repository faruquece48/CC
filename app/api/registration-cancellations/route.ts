import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import nodemailer from "nodemailer";

const auth = (value: unknown) => {
  const provided = Buffer.from(typeof value === "string" ? value : "");
  const expected = Buffer.from(process.env.ADMIN_PASSWORD || "");
  return Boolean(process.env.ADMIN_PASSWORD) && provided.length === expected.length && timingSafeEqual(provided, expected);
};

async function ensureSchema() {
  await sql`CREATE TABLE IF NOT EXISTS cancelledRegistrationData (registration_id BIGINT PRIMARY KEY, registration_data JSONB NOT NULL, cancelled_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS cancelledSingleRegistrationData (original_id BIGINT PRIMARY KEY, registration_id BIGINT NOT NULL, registration_data JSONB NOT NULL, cancelled_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS cancelledTeamRegistrationData (original_id BIGINT PRIMARY KEY, registration_id BIGINT NOT NULL, registration_data JSONB NOT NULL, cancelled_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS qrCollectionLog (normalized_email TEXT NOT NULL, registration_id BIGINT NOT NULL, purpose TEXT NOT NULL CHECK (purpose IN ('kit', 'lunch')), scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY (normalized_email, purpose))`;
  await sql`CREATE TABLE IF NOT EXISTS paymentEmailLog (tran_id TEXT PRIMARY KEY, registration_id BIGINT NOT NULL, recipient TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'sent', sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS certificateEmailLog (normalized_email TEXT PRIMARY KEY, registration_id BIGINT NOT NULL, participant_name TEXT NOT NULL, recipient TEXT NOT NULL, certificate_id TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'sending', sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
}

async function listCancellations() {
  const [individual, teams] = await Promise.all([
    sql`SELECT c.registration_id, c.cancelled_at, c.registration_data->>'name' name, c.registration_data->>'email' email, c.registration_data->>'phonenumber' phonenumber, c.registration_data->>'department' department, c.registration_data->>'university' university, c.registration_data->'events' events, COALESCE((m.registration_data->>'fee')::numeric, 0) fee, m.registration_data->>'tran_id' tran_id, COALESCE((m.registration_data->>'ispaid')::boolean, FALSE) was_paid FROM cancelledSingleRegistrationData c JOIN cancelledRegistrationData m USING (registration_id) ORDER BY c.cancelled_at DESC, c.registration_id DESC`,
    sql`SELECT c.registration_id, c.cancelled_at, c.registration_data->>'event' event, c.registration_data->>'teamname' teamname, c.registration_data->>'delivery_address' delivery_address, c.registration_data->'members' members, COALESCE((m.registration_data->>'fee')::numeric, 0) fee, m.registration_data->>'tran_id' tran_id, COALESCE((m.registration_data->>'ispaid')::boolean, FALSE) was_paid FROM cancelledTeamRegistrationData c JOIN cancelledRegistrationData m USING (registration_id) ORDER BY c.cancelled_at DESC, c.registration_id DESC`,
  ]);
  return { individual: individual.rows, teams: teams.rows };
}

function cancellationEmail(id: number) {
  return { subject: `Registration ${id} canceled - Construct Carnival 2.0`, html: `<div style="margin:0;background:#f3efe6;padding:28px 12px;font-family:Georgia,'Times New Roman',serif;color:#263238"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;margin:0 auto;background:#fffdf8;border:1px solid #d8c9a7;box-shadow:0 12px 35px rgba(50,42,28,.12)"><tr><td style="height:7px;background:#173f3a"></td></tr><tr><td style="padding:34px 38px 26px;text-align:center;border-bottom:1px solid #d8c9a7"><img src="https://constructcarnival.com/logo/blue-main_x1024.png" width="150" alt="Construct Carnival 2.0" style="display:block;width:150px;max-width:60%;height:auto;margin:0 auto;border:0"><p style="margin:16px 0 5px;color:#b08b3e;font:700 11px Arial,sans-serif;letter-spacing:3px;text-transform:uppercase">Official Notice</p><h1 style="margin:0;color:#173f3a;font-size:28px;font-weight:normal;line-height:1.25">Registration Cancellation</h1><p style="margin:8px 0 0;color:#6b6254;font:13px Arial,sans-serif">Construct Carnival 2.0</p></td></tr><tr><td style="padding:34px 42px"><p style="margin:0 0 20px;font-size:17px"><strong>Dear Participant,</strong></p><p style="margin:0 0 22px;font-size:15px;line-height:1.8;color:#4b4b45">This is to formally notify you that your registration for <strong style="color:#173f3a">Construct Carnival 2.0</strong> has been canceled by the event administration.</p><table role="presentation" cellpadding="0" cellspacing="0" style="width:auto;min-width:285px;margin:24px auto;border:1px solid #d8c9a7;background:#faf7ef"><tr><td style="padding:14px 12px 14px 16px;color:#756a57;font:11px Arial,sans-serif;letter-spacing:1.5px;text-transform:uppercase;white-space:nowrap">Registration ID</td><td style="padding:14px 16px 14px 12px;color:#173f3a;font:bold 21px Georgia,serif;white-space:nowrap">${id}</td></tr></table><p style="margin:0 0 26px;font-size:15px;line-height:1.8;color:#4b4b45">This registration and its associated participant services will no longer be active. If you believe this notice was issued in error, please contact the event organizing committee.</p><div style="margin:0 0 26px;padding:14px 16px;border-left:4px solid #b08b3e;background:#faf7ef;color:#504a40;font:14px Arial,sans-serif;line-height:1.65"><strong style="color:#173f3a">Refund update:</strong> You will be informed of the refund schedule soon.</div><div style="padding-top:20px;border-top:1px solid #e4dac4;font-size:14px;line-height:1.7;color:#504a40"><strong style="color:#173f3a">With regards,</strong><br>Event Organizing Committee<br><span style="color:#b08b3e">Construct Carnival 2.0</span><br>Department of BECM, RUET</div></td></tr><tr><td style="padding:15px 24px;background:#173f3a;text-align:center;color:#e8dcc1;font:10px Arial,sans-serif;letter-spacing:1.4px;text-transform:uppercase">Building Future, Managing Reality</td></tr></table></div>` };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!auth(body.password)) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    await ensureSchema();
    if (body.action === "list") return NextResponse.json({ success: true, ...(await listCancellations()) });
    const id = Number(body.registrationId);
    if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ success: false, message: "Invalid registration ID" }, { status: 400 });
    if (body.action === "preview") {
      const people = await sql`SELECT name, email FROM singleRegistrationData WHERE registration_id = ${id} UNION ALL SELECT member->>'name', member->>'email' FROM teamRegistrationData, LATERAL jsonb_array_elements(members) member WHERE registration_id = ${id}`;
      const recipients = people.rows.filter(row => row.email).map(row => ({ name: String(row.name || "Participant"), email: String(row.email) }));
      if (!recipients.length) return NextResponse.json({ success: false, message: "Registration ID not found or has no recipient email." }, { status: 404 });
      return NextResponse.json({ success: true, recipients, ...cancellationEmail(id) });
    }
    if (body.action === "restore") {
      const active = await sql`SELECT 1 FROM registrationData WHERE id = ${id}`;
      if (active.rowCount) return NextResponse.json({ success: false, message: "This registration ID is already active and cannot be restored." }, { status: 409 });
      const restored = await sql`WITH restored_master AS (
          INSERT INTO registrationData
          SELECT (jsonb_populate_record(NULL::registrationData, c.registration_data)).*
          FROM cancelledRegistrationData c WHERE c.registration_id = ${id}
          RETURNING id
        ), restored_single AS (
          INSERT INTO singleRegistrationData
          SELECT (jsonb_populate_record(NULL::singleRegistrationData, c.registration_data)).*
          FROM cancelledSingleRegistrationData c JOIN restored_master m ON m.id = c.registration_id
          RETURNING registration_id
        ), restored_team AS (
          INSERT INTO teamRegistrationData
          SELECT (jsonb_populate_record(NULL::teamRegistrationData, c.registration_data)).*
          FROM cancelledTeamRegistrationData c JOIN restored_master m ON m.id = c.registration_id
          RETURNING registration_id
        ), removed_single_archive AS (
          DELETE FROM cancelledSingleRegistrationData WHERE registration_id IN (SELECT id FROM restored_master)
        ), removed_team_archive AS (
          DELETE FROM cancelledTeamRegistrationData WHERE registration_id IN (SELECT id FROM restored_master)
        )
        DELETE FROM cancelledRegistrationData WHERE registration_id IN (SELECT id FROM restored_master) RETURNING registration_id`;
      if (!restored.rowCount) return NextResponse.json({ success: false, message: "Canceled registration ID not found." }, { status: 404 });
      return NextResponse.json({ success: true, message: `Registration ${id} was restored and is active on the participant pages again.`, ...(await listCancellations()) });
    }
    if (body.action !== "cancel") return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
    const people = await sql`SELECT name, email FROM singleRegistrationData WHERE registration_id = ${id} UNION ALL SELECT member->>'name', member->>'email' FROM teamRegistrationData, LATERAL jsonb_array_elements(members) member WHERE registration_id = ${id}`;
    const recipients = [...new Map(people.rows.filter(row => row.email).map(row => [String(row.email).trim().toLowerCase(), { name: String(row.name || "Participant"), email: String(row.email).trim() }])).values()];
    const result = await sql`WITH target AS (SELECT * FROM registrationData WHERE id = ${id}),
      am AS (INSERT INTO cancelledRegistrationData (registration_id, registration_data) SELECT id, TO_JSONB(target) FROM target ON CONFLICT (registration_id) DO NOTHING RETURNING registration_id),
      asi AS (INSERT INTO cancelledSingleRegistrationData (original_id, registration_id, registration_data) SELECT s.id, s.registration_id, TO_JSONB(s) FROM singleRegistrationData s JOIN am ON am.registration_id=s.registration_id ON CONFLICT (original_id) DO NOTHING RETURNING registration_id),
      ate AS (INSERT INTO cancelledTeamRegistrationData (original_id, registration_id, registration_data) SELECT t.id, t.registration_id, TO_JSONB(t) FROM teamRegistrationData t JOIN am ON am.registration_id=t.registration_id ON CONFLICT (original_id) DO NOTHING RETURNING registration_id),
      dq AS (DELETE FROM qrCollectionLog WHERE registration_id IN (SELECT registration_id FROM am)),
      dp AS (DELETE FROM paymentEmailLog WHERE registration_id IN (SELECT registration_id FROM am)),
      dc AS (DELETE FROM certificateEmailLog WHERE registration_id IN (SELECT registration_id FROM am)),
      ds AS (DELETE FROM singleRegistrationData WHERE registration_id IN (SELECT registration_id FROM am)),
      dt AS (DELETE FROM teamRegistrationData WHERE registration_id IN (SELECT registration_id FROM am))
      DELETE FROM registrationData WHERE id IN (SELECT registration_id FROM am) RETURNING id`;
    if (!result.rowCount) {
      const old = await sql`SELECT 1 FROM cancelledRegistrationData WHERE registration_id = ${id}`;
      return NextResponse.json({ success: false, message: old.rowCount ? "This registration is already canceled." : "Registration ID not found." }, { status: 404 });
    }
    let deliveryMessage = " No valid recipient email was found.";
    if (recipients.length) {
      try {
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) throw new Error("Gmail credentials are not configured");
        const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
        const content = cancellationEmail(id);
        for (const recipient of recipients) {
          await transporter.sendMail({ from: `"Construct Carnival" <${process.env.GMAIL_USER}>`, to: recipient.email, ...content });
        }
        deliveryMessage = ` Cancellation email sent to ${recipients.map(recipient => recipient.email).join(", ")}.`;
      } catch (emailError) {
        console.error("CANCELLATION EMAIL ERROR:", emailError);
        deliveryMessage = " The registration was canceled, but the email could not be sent. Check the email credentials and server log.";
      }
    }
    return NextResponse.json({ success: true, message: `Registration ${id} was canceled and removed from all active pages.${deliveryMessage}`, ...(await listCancellations()) });
  } catch (error) {
    console.error("REGISTRATION CANCELLATION ERROR:", error);
    return NextResponse.json({ success: false, message: "Unable to cancel this registration." }, { status: 500 });
  }
}
