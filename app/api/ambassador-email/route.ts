import { timingSafeEqual } from "node:crypto";
import path from "node:path";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { sql } from "@vercel/postgres";
import { ambassadors } from "@/lib/ambassadors";
import { ambassadorInvitationHtml, ambassadorInvitationSubject, ambassadorInvitationText } from "@/lib/ambassadorInvitationEmail";

function authorized(password: unknown) {
  const normalize = (value: string) => value.replace(/\s+/g, "");
  const supplied = Buffer.from(normalize(typeof password === "string" ? password : ""));
  const expected = Buffer.from(normalize(process.env.ADMIN_PASSWORD || ""));
  return Boolean(process.env.ADMIN_PASSWORD) && supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
async function ensureLog() {
  await sql`CREATE TABLE IF NOT EXISTS ambassadorInvitationEmailLog (
    ambassador_code TEXT PRIMARY KEY, recipient TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'sending',
    sent_at TIMESTAMPTZ, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), error_message TEXT
  )`;
}
export async function POST(request: Request) {
  try {
    const { password, action, codes, forceResend } = await request.json();
    if (!authorized(password)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    await ensureLog();
    if (action === "list") {
      const logs = await sql`SELECT ambassador_code,status,sent_at FROM ambassadorInvitationEmailLog`;
      const byCode = new Map(logs.rows.map(row => [String(row.ambassador_code), row]));
      return NextResponse.json({ subject: ambassadorInvitationSubject, ambassadors: ambassadors.map(person => ({
        ...person, invitation_status: byCode.get(person.code)?.status || "not_sent",
        invitation_sent_at: byCode.get(person.code)?.sent_at || null,
      })) }, { headers: { "Cache-Control": "no-store" } });
    }
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return NextResponse.json({ message: "Email service is not configured." }, { status: 500 });
    const selected = ambassadors.filter(person => Array.isArray(codes) && codes.includes(person.code));
    if (!selected.length) return NextResponse.json({ message: "Select at least one ambassador." }, { status: 400 });
    const transporter = nodemailer.createTransport({ service: "gmail", connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000, auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
    const results: { code: string; status: "sent" | "failed" | "already_sent"; message?: string }[] = [];
    for (const person of selected) {
      const claim = await sql`INSERT INTO ambassadorInvitationEmailLog (ambassador_code,recipient,status,updated_at,error_message)
        VALUES (${person.code},${person.email},'sending',NOW(),NULL)
        ON CONFLICT (ambassador_code) DO UPDATE SET recipient=EXCLUDED.recipient,status='sending',updated_at=NOW(),error_message=NULL
        WHERE (ambassadorInvitationEmailLog.status='sent' AND ${forceResend === true})
           OR ambassadorInvitationEmailLog.status<>'sent'
        RETURNING ambassador_code`;
      if (!claim.rowCount) { results.push({ code: person.code, status: "already_sent" }); continue; }
      try {
        await transporter.sendMail({
          from: `"Construct Carnival" <${process.env.GMAIL_USER}>`, to: person.email,
          subject: ambassadorInvitationSubject, text: ambassadorInvitationText(person), html: ambassadorInvitationHtml(person),
          attachments: [{ filename: "Construct-Carnival-2.0-Invitation-Poster.jpeg", path: path.join(process.cwd(), "public", "images", "poster.jpeg") }],
        });
        await sql`UPDATE ambassadorInvitationEmailLog SET status='sent',sent_at=NOW(),updated_at=NOW(),error_message=NULL WHERE ambassador_code=${person.code}`;
        results.push({ code: person.code, status: "sent" });
      } catch (error) {
        const message = error instanceof Error ? error.message.slice(0, 300) : "Delivery failed";
        await sql`UPDATE ambassadorInvitationEmailLog SET status='failed',updated_at=NOW(),error_message=${message} WHERE ambassador_code=${person.code}`;
        results.push({ code: person.code, status: "failed", message });
      }
    }
    const sent = results.filter(result => result.status === "sent").length;
    const failed = results.filter(result => result.status === "failed").length;
    const alreadySent = results.filter(result => result.status === "already_sent").length;
    return NextResponse.json({ sent, failed, alreadySent, results }, { status: failed && !sent && !alreadySent ? 502 : 200 });
  } catch (error) {
    console.error("AMBASSADOR INVITATION EMAIL:", error);
    return NextResponse.json({ message: "Unable to process ambassador invitation emails." }, { status: 500 });
  }
}
