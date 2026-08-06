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
            member_3,
            member_3_email,
            member_3_phonenumber,
            member_3_department,
            member_3_university,
            email,
            phonenumber,
            department,
            university,
            criteria,
            isteam,
            ispaid
        } = body;

        const selectedEvents = Array.isArray(criteria) ? criteria.filter(Boolean) : [];
        const individualFees = [0, 400, 600, 800, 900, 1000];
        const calculatedFee = isteam
            ? (member_3 ? 1200 : 800) * selectedEvents.length
            : individualFees[Math.min(selectedEvents.length, 5)];

        if (selectedEvents.length === 0) {
            return NextResponse.json(
                { success: false, message: "Please select at least one event" },
                { status: 400 }
            );
        }

        await sql`
            INSERT INTO registrationData (
                teamname,
                member_1,
                member_2,
                member_2_email,
                member_2_phonenumber,
                member_2_department,
                member_2_university,
                member_3,
                member_3_email,
                member_3_phonenumber,
                member_3_department,
                member_3_university,
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
                ${member_3 || ""},
                ${member_3_email || ""},
                ${member_3_phonenumber || ""},
                ${member_3_department || ""},
                ${member_3_university || ""},
                ${email},
                ${phonenumber},
                ${department},
                ${university},
                ${criteria},
                ${calculatedFee},
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
