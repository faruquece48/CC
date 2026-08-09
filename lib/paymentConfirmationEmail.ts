import nodemailer from "nodemailer";
import { sql } from "@vercel/postgres";
import { join } from "node:path";

const eventNames: Record<string, string> = {
    cad: "CAD Expert",
    mechamind: "Mechamind",
    management: "Management Maestro",
    truss: "Truss Combat",
    poster: "Poster Presentation",
};

const escapeHtml = (value: unknown) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const formatEvent = (event: string) => eventNames[event] || event;

export async function sendRegistrationPaymentEmail(
    tranId: string,
    payment: Record<string, unknown>,
    options: { testMode?: boolean } = {},
) {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.error("PAYMENT EMAIL: Gmail configuration is missing.");
        return false;
    }

    const registrationResult = await sql`
        SELECT id, member_1, email, phonenumber, fee, tran_id
        FROM registrationData
        WHERE tran_id = ${tranId}
        LIMIT 1
    `;
    const registration = registrationResult.rows[0];

    if (!registration) {
        console.error("PAYMENT EMAIL: Registration not found:", tranId);
        return false;
    }

    if (!options.testMode) {
        await sql`
            CREATE TABLE IF NOT EXISTS paymentEmailLog (
                tran_id TEXT PRIMARY KEY,
                registration_id BIGINT NOT NULL,
                recipient TEXT NOT NULL,
                sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `;

        const claim = await sql`
            INSERT INTO paymentEmailLog (tran_id, registration_id, recipient)
            VALUES (${tranId}, ${registration.id}, ${registration.email})
            ON CONFLICT (tran_id) DO NOTHING
            RETURNING tran_id
        `;

        if (claim.rowCount === 0) return true;
    }

    try {
        const [individualResult, teamResult] = await Promise.all([
            sql`
                SELECT name, email, phonenumber, department, university, events
                FROM singleRegistrationData
                WHERE registration_id = ${registration.id}
                ORDER BY id
            `,
            sql`
                SELECT event, teamname, members
                FROM teamRegistrationData
                WHERE registration_id = ${registration.id}
                ORDER BY id
            `,
        ]);

        const individualRows = individualResult.rows.map((row) => `
            <tr>
                <td style="padding:8px;border:1px solid #d1d5db;">${escapeHtml(row.name)}</td>
                <td style="padding:8px;border:1px solid #d1d5db;">${escapeHtml(
                    (row.events || []).map(formatEvent).join(", "),
                )}</td>
                <td style="padding:8px;border:1px solid #d1d5db;">${escapeHtml(row.email)}</td>
            </tr>
        `).join("");

        const teamRows = teamResult.rows.flatMap((team) => {
            const members = Array.isArray(team.members) ? team.members : [];
            return members.map((member: Record<string, unknown>, index: number) => `
                <tr>
                    ${index === 0 ? `<td rowspan="${members.length}" style="padding:8px;border:1px solid #d1d5db;vertical-align:middle;font-weight:600;">${escapeHtml(team.teamname)}</td>` : ""}
                    ${index === 0 ? `<td rowspan="${members.length}" style="padding:8px;border:1px solid #d1d5db;vertical-align:middle;">${escapeHtml(formatEvent(team.event))}</td>` : ""}
                    <td style="padding:8px;border:1px solid #d1d5db;">${escapeHtml(member.name)}</td>
                </tr>
            `);
        }).join("");

        const transporter = nodemailer.createTransport({
            service: "gmail",
            connectionTimeout: 10_000,
            greetingTimeout: 10_000,
            socketTimeout: 15_000,
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: `"Construct Carnival" <${process.env.GMAIL_USER}>`,
            to: registration.email,
            subject: `${options.testMode ? "[TEST] " : ""}Payment confirmed - Registration #${registration.id}`,
            attachments: [
                {
                    filename: "event-head-signature.png",
                    path: join(process.cwd(), "public", "images", "signature.png"),
                    cid: "event-head-signature",
                },
            ],
            html: `
                <div style="margin:0 auto;max-width:680px;font-family:Arial,sans-serif;color:#1f2937;">
                    <div style="padding:24px;text-align:center;border:1px solid #d1d5db;border-bottom:0;">
                        <img src="https://constructcarnival.com/logo/blue-main_x1024.png" alt="Construct Carnival logo" width="80" height="80" style="display:block;margin:0 auto;object-fit:contain;" />
                        <h1 style="margin:8px 0 0;font-size:24px;color:#111827;">Construct Carnival 2.0</h1>
                        <p style="margin:6px 0 0;color:#0369a1;font-weight:600;">Building Future, Managing Reality</p>
                    </div>
                    <div style="background:#064e3b;padding:16px;color:white;text-align:center;">
                        <h2 style="margin:0;font-size:20px;">Payment Confirmed</h2>
                    </div>
                    <div style="padding:24px;border:1px solid #d1d5db;border-top:0;">
                        <p>Dear ${escapeHtml(registration.member_1)},</p>
                        <p>Your registration payment has been successfully confirmed.</p>
                        <div style="margin:20px 0;padding:16px;background:#f0fdf4;border-left:4px solid #16a34a;">
                            <p style="margin:4px 0;"><strong>Registration ID:</strong> ${escapeHtml(registration.id)}</p>
                            <p style="margin:4px 0;"><strong>Transaction ID:</strong> ${escapeHtml(tranId)}</p>
                            <p style="margin:4px 0;"><strong>Gateway Transaction:</strong> ${escapeHtml(payment.bank_tran_id || payment.val_id || "-")}</p>
                            <p style="margin:4px 0;"><strong>Amount:</strong> ${escapeHtml(payment.amount || registration.fee)} BDT</p>
                            <p style="margin:4px 0;"><strong>Payment Status:</strong> Paid</p>
                        </div>
                        ${individualRows ? `
                            <h2 style="font-size:18px;">Individual Event Registration</h2>
                            <table style="width:100%;border-collapse:collapse;">
                                <thead><tr><th style="padding:8px;border:1px solid #d1d5db;text-align:left;">Participant</th><th style="padding:8px;border:1px solid #d1d5db;text-align:left;">Events</th><th style="padding:8px;border:1px solid #d1d5db;text-align:left;">Email</th></tr></thead>
                                <tbody>${individualRows}</tbody>
                            </table>
                        ` : ""}
                        ${teamRows ? `
                            <h2 style="font-size:18px;">Team Event Registration</h2>
                            <table style="width:100%;border-collapse:collapse;">
                                <thead><tr><th style="padding:8px;border:1px solid #d1d5db;text-align:left;">Team</th><th style="padding:8px;border:1px solid #d1d5db;text-align:left;">Event</th><th style="padding:8px;border:1px solid #d1d5db;text-align:left;">Member</th></tr></thead>
                                <tbody>${teamRows}</tbody>
                            </table>
                        ` : ""}
                        <p style="margin-top:24px;color:#4b5563;">This is an electronically generated payment slip and requires no further verification.</p>
                        <div style="margin-top:56px;text-align:right;">
                            <div style="display:inline-block;width:220px;text-align:center;">
                                <img src="cid:event-head-signature" alt="Electronic signature of Event Head" height="96" style="display:block;width:auto;height:96px;margin:0 auto 4px;object-fit:contain;" />
                                <div style="border-top:1px solid #374151;padding-top:8px;font-weight:600;">Signature of Event Head</div>
                                <p style="margin:5px 0 0;color:#6b7280;font-size:13px;">Construct Carnival 2.0</p>
                            </div>
                        </div>
                    </div>
                </div>
            `,
        });

        console.log("PAYMENT EMAIL: Confirmation sent:", tranId);
        return true;
    } catch (error) {
        if (!options.testMode) {
            await sql`DELETE FROM paymentEmailLog WHERE tran_id = ${tranId}`;
        }
        console.error("PAYMENT EMAIL ERROR:", error);
        return false;
    }
}
