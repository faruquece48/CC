import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import {
    createRegistrationOtp,
    ensureRegistrationOtpTable,
    findPriorParticipant,
    hashRegistrationOtp,
    sendRegistrationOtp
} from "@/lib/priorRegistration";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const email = String(body.email || "").trim().toLowerCase();
        const event = String(body.event || "");
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            return NextResponse.json({ message: "Enter a valid email address" }, { status: 400 });
        }

        const participant = await findPriorParticipant(email);
        if (!participant) {
            return NextResponse.json({ message: "No paid registration was found for this email" }, { status: 404 });
        }
        if (event && participant.previousEvents.includes(event)) {
            return NextResponse.json(
                { message: "This participant has already registered for the selected event" },
                { status: 409 }
            );
        }

        await ensureRegistrationOtpTable();
        const recent = await sql`
            SELECT 1 FROM registrationEmailOtp
            WHERE email = ${email} AND created_at > NOW() - INTERVAL '60 seconds'
        `;
        if (recent.rowCount) {
            return NextResponse.json({ message: "Please wait one minute before requesting another code" }, { status: 429 });
        }

        const otp = createRegistrationOtp();
        await sendRegistrationOtp(email, otp);
        await sql`
            INSERT INTO registrationEmailOtp (email, code_hash, expires_at, created_at, attempts)
            VALUES (${email}, ${hashRegistrationOtp(email, otp)}, NOW() + INTERVAL '10 minutes', NOW(), 0)
            ON CONFLICT (email) DO UPDATE SET
                code_hash = EXCLUDED.code_hash,
                expires_at = EXCLUDED.expires_at,
                created_at = EXCLUDED.created_at,
                attempts = 0
        `;

        return NextResponse.json({ message: "Verification code sent" });
    } catch (error) {
        console.error("REGISTRATION OTP REQUEST ERROR:", error);
        const emailAuthFailed = error && typeof error === "object" && "code" in error && error.code === "EAUTH";
        return NextResponse.json(
            {
                message: emailAuthFailed
                    ? "Email delivery is temporarily unavailable. Please contact the registration team."
                    : "Could not send the verification code"
            },
            { status: 500 }
        );
    }
}
