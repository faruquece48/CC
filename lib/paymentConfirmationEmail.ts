import nodemailer from "nodemailer";
import { sql } from "@vercel/postgres";
import QRCode from "qrcode";
import { createPaymentVerificationUrl } from "@/lib/paymentVerification";
import { createPaymentSlipPdf } from "@/lib/paymentSlipPdf";

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
const brandedEventName = '<span style="color:#14532d;">Construct</span> <span style="color:#ca8a04;">Carnival</span> <span style="color:#c65d13;">2.0</span>';

export async function sendRegistrationPaymentEmail(
    tranId: string,
    payment: Record<string, unknown>,
    options: { testMode?: boolean; throwOnError?: boolean } = {},
) {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.error("PAYMENT EMAIL: Gmail configuration is missing.");
        if (options.throwOnError) {
            throw Object.assign(new Error("Gmail configuration is missing."), {
                code: "ECONFIG",
            });
        }
        return false;
    }

    const registrationResult = await sql`
        SELECT id, member_1, email, phonenumber, department, university, fee, tran_id
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
                status TEXT NOT NULL DEFAULT 'sending',
                sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `;

        await sql`
            ALTER TABLE paymentEmailLog
            ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'sent'
        `;

        const claim = await sql`
            INSERT INTO paymentEmailLog (
                tran_id, registration_id, recipient, status, sent_at
            )
            VALUES (
                ${tranId}, ${registration.id}, ${registration.email}, 'sending', NOW()
            )
            ON CONFLICT (tran_id) DO UPDATE
            SET status = 'sending', sent_at = NOW()
            WHERE paymentEmailLog.status <> 'sent'
              AND paymentEmailLog.sent_at < NOW() - INTERVAL '30 seconds'
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

        const verificationUrl = createPaymentVerificationUrl(tranId);
        const verificationQr = await QRCode.toBuffer(verificationUrl, {
            width: 220,
            margin: 1,
            errorCorrectionLevel: "M",
        });
        const paymentSlipPdf = await createPaymentSlipPdf({
            registrationId: registration.id,
            participantName: registration.member_1,
            email: registration.email,
            phone: registration.phonenumber,
            department: registration.department,
            university: registration.university,
            transactionId: tranId,
            amount: payment.amount || registration.fee,
            individual: individualResult.rows as any,
            teams: teamResult.rows as any,
            qrCode: verificationQr,
            formatEvent,
        });

        await transporter.sendMail({
            from: `"Construct Carnival" <${process.env.GMAIL_USER}>`,
            to: registration.email,
            subject: "Registration Confirmation for Construct Carnival 2.0",
            attachments: [
                {
                    filename: `Construct-Carnival-Payment-Slip-${registration.id}.pdf`,
                    content: paymentSlipPdf,
                    contentType: "application/pdf",
                },
            ],
            text: `Dear ${registration.member_1},

Thank you for participating in Construct Carnival 2.0. We are delighted to have you as part of the event and truly appreciate your enthusiasm and participation. Your official registration and payment details are provided in the attachment. Please review the attachment for your participant and event information.

We look forward to welcoming you to Construct Carnival 2.0 and wish you a wonderful experience.

Best regards,
Construct Carnival 2.0
Building Future, Managing Reality`,
            html: `
                <div style="margin:0 auto;max-width:640px;font-family:Arial,sans-serif;color:#1f2937;font-size:15px;line-height:1.6;">
                    <p><strong>Dear ${escapeHtml(registration.member_1)},</strong></p>
                    <p style="text-align:justify;">Thank you for participating in <strong>${brandedEventName}</strong>. We are delighted to have you as part of the event and truly appreciate your enthusiasm and participation. Your official registration and payment details are provided in the attachment. Please review the attachment for your participant and event information.</p>
                    <p style="text-align:justify;">We look forward to welcoming you to <strong>${brandedEventName}</strong> and wish you a wonderful experience.</p>
                    <p style="margin-top:28px;"><strong>Best regards,</strong><br /><strong>${brandedEventName}</strong><br /><span style="color:#111827;">Building Future, Managing Reality</span></p>
                </div>
            `,
        });

        if (!options.testMode) {
            await sql`
                UPDATE paymentEmailLog
                SET status = 'sent', sent_at = NOW()
                WHERE tran_id = ${tranId}
            `;
        }

        console.log("PAYMENT EMAIL: Confirmation sent:", tranId);
        return true;
    } catch (error) {
        if (!options.testMode) {
            await sql`DELETE FROM paymentEmailLog WHERE tran_id = ${tranId}`;
        }
        console.error("PAYMENT EMAIL ERROR:", error);
        if (options.throwOnError) throw error;
        return false;
    }
}
