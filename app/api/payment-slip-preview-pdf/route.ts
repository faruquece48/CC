import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import QRCode from "qrcode";
import { createPaymentSlipPdf } from "@/lib/paymentSlipPdf";
import { createPaymentVerificationUrl } from "@/lib/paymentVerification";

export const runtime = "nodejs";

const eventNames: Record<string, string> = {
    cad: "CAD Expert",
    mechamind: "Mechamind",
    management: "Management Maestro",
    truss: "Truss Combat",
    poster: "Poster Presentation",
};

const formatEvent = (event: string) => eventNames[event] || event;

export async function POST(request: Request) {
    const { password, registrationId } = await request.json();
    const provided = Buffer.from(typeof password === "string" ? password : "");
    const expected = Buffer.from(process.env.ADMIN_PASSWORD || "");

    if (
        !process.env.ADMIN_PASSWORD ||
        provided.length !== expected.length ||
        !timingSafeEqual(provided, expected)
    ) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const id = Number(registrationId);
    if (!Number.isInteger(id) || id <= 0) {
        return NextResponse.json({ message: "Invalid Registration ID" }, { status: 400 });
    }

    const registrationResult = await sql`
        SELECT id, member_1, email, phonenumber, department, university, fee, tran_id
        FROM registrationData
        WHERE id = ${id} AND ispaid = TRUE
        LIMIT 1
    `;
    const registration = registrationResult.rows[0];

    if (!registration) {
        return NextResponse.json({ message: "Paid registration not found" }, { status: 404 });
    }

    const [individualResult, teamResult] = await Promise.all([
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

    const verificationUrl = createPaymentVerificationUrl(registration.tran_id);
    const verificationQr = await QRCode.toBuffer(verificationUrl, {
        width: 220,
        margin: 1,
        errorCorrectionLevel: "M",
    });
    const pdf = await createPaymentSlipPdf({
        registrationId: registration.id,
        participantName: registration.member_1,
        email: registration.email,
        phone: registration.phonenumber,
        department: registration.department,
        university: registration.university,
        transactionId: registration.tran_id,
        amount: registration.fee,
        individual: individualResult.rows as any,
        teams: teamResult.rows as any,
        qrCode: verificationQr,
        formatEvent,
    });

    return new Response(new Uint8Array(pdf), {
        headers: {
            "Cache-Control": "no-store",
            "Content-Disposition": `inline; filename="Construct-Carnival-Payment-Slip-${registration.id}.pdf"`,
            "Content-Type": "application/pdf",
        },
    });
}
