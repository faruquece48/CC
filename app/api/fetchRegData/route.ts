import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function POST(request: Request) {
    try {
        const { password, table } = await request.json();

        // Check admin password
        if (password !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized"
                },
                { status: 401 }
            );
        }

        let data;

        // ===================== REGISTRATION TABLE =====================
        if (table === "registration") {

            data = await sql`
                SELECT *
                FROM registrationData
                ORDER BY id DESC
            `;

        } else if (table === "singleRegistration") {

            data = await sql`
                SELECT single_data.*, master.fee AS total_fee,
                       master.ispaid, master.tran_id
                FROM singleRegistrationData AS single_data
                JOIN registrationData AS master
                  ON master.id = single_data.registration_id
                ORDER BY single_data.id DESC
            `;

        } else if (table === "teamRegistration") {

            data = await sql`
                SELECT team_data.*, master.fee AS total_fee,
                       master.ispaid, master.tran_id
                FROM teamRegistrationData AS team_data
                JOIN registrationData AS master
                  ON master.id = team_data.registration_id
                ORDER BY team_data.id DESC
            `;

        // ===================== SUPPORT TABLE =====================
        } else if (table === "support") {

            data = await sql`
                SELECT *
                FROM supportData
                ORDER BY id DESC
            `;

        // ===================== INVALID TABLE =====================
        } else {

            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid table name"
                },
                { status: 400 }
            );
        }

        // ===================== SUCCESS RESPONSE =====================
        return NextResponse.json({
            success: true,
            data: data.rows
        });

    } catch (error) {

        console.log("Fetch API Error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Server Error"
            },
            { status: 500 }
        );
    }
}
