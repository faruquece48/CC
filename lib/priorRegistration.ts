import { createHash, randomInt } from "crypto";
import nodemailer from "nodemailer";
import { sql } from "@vercel/postgres";

export type PriorParticipant = {
    name: string;
    email: string;
    phoneNumber: string;
    department: string;
    university: string;
    previousEvents: string[];
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const hashRegistrationOtp = (email: string, otp: string) =>
    createHash("sha256")
        .update(`${normalizeEmail(email)}:${otp}:${process.env.ADMIN_SESSION_SECRET || process.env.GMAIL_APP_PASSWORD || "registration-otp"}`)
        .digest("hex");

export const createRegistrationOtp = () => randomInt(100000, 1000000).toString();

export async function ensureRegistrationOtpTable() {
    await sql`
        CREATE TABLE IF NOT EXISTS registrationEmailOtp (
            email TEXT PRIMARY KEY,
            code_hash TEXT NOT NULL,
            expires_at TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            attempts INTEGER NOT NULL DEFAULT 0
        )
    `;
}

export async function findPriorParticipant(rawEmail: string): Promise<PriorParticipant | null> {
    const email = normalizeEmail(rawEmail);
    const result = await sql`
        SELECT name, email, phonenumber, department, university
        FROM (
            SELECT s.registration_id, s.name, s.email, s.phonenumber, s.department, s.university
            FROM singleRegistrationData s
            JOIN registrationData r ON r.id = s.registration_id
            WHERE r.ispaid = TRUE AND LOWER(s.email) = ${email}

            UNION ALL

            SELECT t.registration_id,
                member->>'name', member->>'email', member->>'phoneNumber',
                member->>'department', member->>'university'
            FROM teamRegistrationData t
            JOIN registrationData r ON r.id = t.registration_id
            CROSS JOIN LATERAL jsonb_array_elements(t.members) AS member
            WHERE r.ispaid = TRUE AND LOWER(member->>'email') = ${email}

            UNION ALL

            SELECT id, member_1, email, phonenumber, department, university
            FROM registrationData
            WHERE ispaid = TRUE AND LOWER(email) = ${email}

            UNION ALL

            SELECT id, member_2, member_2_email, member_2_phonenumber,
                member_2_department, member_2_university
            FROM registrationData
            WHERE ispaid = TRUE AND LOWER(member_2_email) = ${email}

            UNION ALL

            SELECT id, member_3, member_3_email, member_3_phonenumber,
                member_3_department, member_3_university
            FROM registrationData
            WHERE ispaid = TRUE AND LOWER(member_3_email) = ${email}
        ) participant
        WHERE name <> ''
        ORDER BY registration_id DESC
        LIMIT 1
    `;

    const participant = result.rows[0];
    if (!participant) return null;

    const eventsResult = await sql`
        SELECT DISTINCT event
        FROM (
            SELECT UNNEST(s.events) AS event
            FROM singleRegistrationData s
            JOIN registrationData r ON r.id = s.registration_id
            WHERE r.ispaid = TRUE AND LOWER(s.email) = ${email}

            UNION ALL

            SELECT t.event
            FROM teamRegistrationData t
            JOIN registrationData r ON r.id = t.registration_id
            CROSS JOIN LATERAL jsonb_array_elements(t.members) AS member
            WHERE r.ispaid = TRUE AND LOWER(member->>'email') = ${email}
        ) paid_events
        WHERE event IN ('cad', 'mechamind', 'management', 'truss', 'poster')
    `;

    return {
        name: participant.name,
        email: normalizeEmail(participant.email),
        phoneNumber: participant.phonenumber,
        department: participant.department,
        university: participant.university,
        previousEvents: eventsResult.rows.map((row) => row.event)
    };
}

export async function sendRegistrationOtp(email: string, otp: string) {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        throw new Error("Email service is not configured");
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD }
    });

    await transporter.sendMail({
        from: `"Construct Carnival" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "Your registration verification code",
        text: `Your Construct Carnival verification code is ${otp}. It expires in 10 minutes.`,
        html: `<p>Your Construct Carnival verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${otp}</p><p>This code expires in 10 minutes. Do not share it with anyone.</p>`
    });
}
