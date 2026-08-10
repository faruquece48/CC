import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import QRCode from "qrcode";
import { createPaymentVerificationUrl } from "@/lib/paymentVerification";

export async function POST(request: Request) {
    const { password, registrationId } = await request.json();
    const provided = Buffer.from(typeof password === "string" ? password : "");
    const expected = Buffer.from(process.env.ADMIN_PASSWORD || "");

    if (
        !process.env.ADMIN_PASSWORD ||
        provided.length !== expected.length ||
        !timingSafeEqual(provided, expected)
    ) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const id = Number(registrationId);
    if (!Number.isInteger(id) || id <= 0) {
        return NextResponse.json({ success: false, message: "Invalid Registration ID" }, { status: 400 });
    }

    const registration = await sql`
        SELECT id, member_1, email, phonenumber, fee, tran_id
        FROM registrationData
        WHERE id = ${id} AND ispaid = TRUE
        LIMIT 1
    `;

    if (registration.rowCount === 0) {
        return NextResponse.json({ success: false, message: "Paid registration not found" }, { status: 404 });
    }

    const [individual, teams] = await Promise.all([
        sql`
            SELECT name, email, events
            FROM singleRegistrationData
            WHERE registration_id = ${id}
            ORDER BY id
        `,
        sql`
            SELECT event, teamname, members
            FROM teamRegistrationData
            WHERE registration_id = ${id}
            ORDER BY id
        `,
    ]);

    const verificationUrl = createPaymentVerificationUrl(registration.rows[0].tran_id);
    const verificationQr = await QRCode.toDataURL(verificationUrl, {
        width: 220,
        margin: 1,
        errorCorrectionLevel: "M",
    });

    return NextResponse.json(
        {
            success: true,
            registration: {
                id: Number(registration.rows[0].id),
                memberName: registration.rows[0].member_1,
                email: registration.rows[0].email,
                phone: registration.rows[0].phonenumber,
                fee: registration.rows[0].fee,
                transactionId: registration.rows[0].tran_id,
                verificationQr,
                individual: individual.rows,
                teams: teams.rows,
            },
        },
        { headers: { "Cache-Control": "no-store" } },
    );
}
