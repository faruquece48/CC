import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { sendRegistrationPaymentEmail } from "@/lib/paymentConfirmationEmail";

export async function POST(request: Request) {
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
        SELECT tran_id, email
        FROM registrationData
        WHERE ispaid = TRUE
        ORDER BY id DESC
        LIMIT 1
    `;
    const tranId = latest.rows[0]?.tran_id;
    const recipient = latest.rows[0]?.email;

    if (!tranId || !recipient) {
        return NextResponse.json(
            { success: false, message: "No paid registration was found." },
            { status: 404 },
        );
    }

    const [localPart, domain = ""] = String(recipient).split("@");
    const maskedRecipient = `${localPart.slice(0, 2)}${"*".repeat(
        Math.max(2, localPart.length - 2),
    )}@${domain}`;

    let sent = false;

    try {
        sent = await sendRegistrationPaymentEmail(
            tranId,
            { amount: "10.00", bank_tran_id: "EMAIL-TEST" },
            { testMode: true, throwOnError: true },
        );
    } catch (error: any) {
        const message = error?.code === "ECONFIG"
            ? "GMAIL_USER or GMAIL_APP_PASSWORD is missing from this Vercel deployment."
            : error?.code === "EAUTH"
            ? "Gmail authentication failed. Verify GMAIL_USER and generate a new App Password for that same account."
            : ["ETIMEDOUT", "ECONNECTION", "ESOCKET"].includes(error?.code)
                ? "The server could not connect to Gmail SMTP. Check the Vercel function logs and retry."
                : error?.code === "ENOENT"
                    ? "The signature image is missing from the deployed project."
                    : "The email provider rejected the message. Check the Vercel function log for details.";

        return NextResponse.json(
            { success: false, message },
            { status: 503, headers: { "Cache-Control": "no-store" } },
        );
    }

    return NextResponse.json(
        {
            success: sent,
            message: sent
                ? `Gmail accepted the test email for delivery to ${maskedRecipient}.`
                : "Test email could not be sent. Check the server log.",
        },
        { status: sent ? 200 : 500 },
    );
}
