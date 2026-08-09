import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

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

    const result = await sql`
        SELECT id, email
        FROM registrationData
        WHERE ispaid = TRUE
        ORDER BY id DESC
    `;

    const registrations = result.rows.map((row) => {
        const [localPart, domain = ""] = String(row.email || "").split("@");
        return {
            id: Number(row.id),
            maskedEmail: `${localPart.slice(0, 2)}${"*".repeat(
                Math.max(2, localPart.length - 2),
            )}@${domain}`,
        };
    });

    return NextResponse.json(
        { success: true, registrations },
        { headers: { "Cache-Control": "no-store" } },
    );
}
