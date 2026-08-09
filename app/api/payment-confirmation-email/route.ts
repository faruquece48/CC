import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { sendRegistrationPaymentEmail } from "@/lib/paymentConfirmationEmail";

export async function POST(request: Request) {
    const { tranId } = await request.json();

    if (typeof tranId !== "string" || !tranId.startsWith("BECMCC")) {
        return NextResponse.json(
            { success: false, message: "Invalid transaction" },
            { status: 400 },
        );
    }

    const registration = await sql`
        SELECT fee
        FROM registrationData
        WHERE tran_id = ${tranId} AND ispaid = TRUE
        LIMIT 1
    `;

    if (registration.rowCount === 0) {
        return NextResponse.json(
            { success: false, message: "Paid registration not found" },
            { status: 404 },
        );
    }

    const sent = await sendRegistrationPaymentEmail(tranId, {
        amount: registration.rows[0].fee,
    });

    return NextResponse.json(
        {
            success: sent,
            message: sent
                ? "Confirmation email processed"
                : "Confirmation email could not be sent",
        },
        {
            status: sent ? 200 : 503,
            headers: { "Cache-Control": "no-store" },
        },
    );
}
