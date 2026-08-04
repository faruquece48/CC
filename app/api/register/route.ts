import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

    try {

        const body = await req.json();

        const {
            teamname,
            member_1,
            member_2,
            member_2_email,
            member_2_phonenumber,
            member_2_department,
            member_2_university,
            email,
            phonenumber,
            department,
            university,
            criteria,
            fee,
            isteam,
            ispaid
        } = body;

        await sql`
            INSERT INTO registrationData (
                teamname,
                member_1,
                member_2,
                member_2_email,
                member_2_phonenumber,
                member_2_department,
                member_2_university,
                email,
                phonenumber,
                department,
                university,
                criteria,
                fee,
                isteam,
                ispaid
            )
            VALUES (
                ${teamname},
                ${member_1},
                ${member_2},
                ${member_2_email || ""},
                ${member_2_phonenumber || ""},
                ${member_2_department || ""},
                ${member_2_university || ""},
                ${email},
                ${phonenumber},
                ${department},
                ${university},
                ${criteria},
                ${fee},
                ${isteam},
                ${ispaid}
            )
        `;

        return NextResponse.json({
            success: true,
            message: "Registration successful"
        });

    } catch (error) {

        console.log(error);

        return NextResponse.json(
            {
                success: false,
                message: "Server error"
            },
            { status: 500 }
        );
    }
}
