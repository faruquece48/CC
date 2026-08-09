import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { sendRegistrationPaymentEmail } from "@/lib/paymentConfirmationEmail";

export async function POST(request: Request) {
    if (process.env.NODE_ENV !== "development") {
        return NextResponse.json({ success: false }, { status: 404 });
    }

    const { password } = await request.json();
    const provided = Buffer.from(typeof password === "string" ? password : "");
    const expected = Buffer.from(process.env.ADMIN_PASSWORD || "");

    if (
        !process.env.ADMIN_PASSWORD ||
        provided.length !== expected.length ||
        !timingSafeEqual(provided, expected)
    ) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const latest = await sql`
        SELECT tran_id
        FROM registrationData
        WHERE ispaid = TRUE
        ORDER BY id DESC
        LIMIT 1
    `;
    const tranId = latest.rows[0]?.tran_id;

    if (!tranId) {
        return NextResponse.json(
            { success: false, message: "No paid registration was found." },
            { status: 404 },
        );
    }

    const sent = await sendRegistrationPaymentEmail(
        tranId,
        { amount: "10.00", bank_tran_id: "LOCAL-EMAIL-TEST" },
        { testMode: true },
    );

    return NextResponse.json(
        {
            success: sent,
            message: sent ? "Test email sent." : "Test email could not be sent. Check the server log.",
        },
        { status: sent ? 200 : 500 },
    );
}
