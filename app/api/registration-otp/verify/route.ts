import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { ensureRegistrationOtpTable, findPriorParticipant, hashRegistrationOtp } from "@/lib/priorRegistration";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const email = String(body.email || "").trim().toLowerCase();
        const otp = String(body.otp || "").trim();
        const event = String(body.event || "");
        if (!/^\S+@\S+\.\S+$/.test(email) || !/^\d{6}$/.test(otp)) {
            return NextResponse.json({ message: "Enter the email and six-digit code" }, { status: 400 });
        }

        await ensureRegistrationOtpTable();
        const result = await sql`
            SELECT code_hash, expires_at, attempts
            FROM registrationEmailOtp
            WHERE email = ${email}
            LIMIT 1
        `;
        const record = result.rows[0];
        if (!record || new Date(record.expires_at) < new Date()) {
            return NextResponse.json({ message: "The verification code has expired" }, { status: 400 });
        }
        if (record.attempts >= 5 || record.code_hash !== hashRegistrationOtp(email, otp)) {
            await sql`UPDATE registrationEmailOtp SET attempts = attempts + 1 WHERE email = ${email}`;
            return NextResponse.json({ message: "The verification code is incorrect" }, { status: 400 });
        }

        const participant = await findPriorParticipant(email);
        if (!participant) {
            return NextResponse.json({ message: "Registration information is no longer available" }, { status: 404 });
        }
        if (event && participant.previousEvents.includes(event)) {
            return NextResponse.json(
                { message: "This participant has already registered for the selected event" },
                { status: 409 }
            );
        }

        await sql`DELETE FROM registrationEmailOtp WHERE email = ${email}`;
        return NextResponse.json({ participant });
    } catch (error) {
        console.error("REGISTRATION OTP VERIFY ERROR:", error);
        return NextResponse.json({ message: "Could not verify the code" }, { status: 500 });
    }
}
