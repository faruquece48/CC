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

        await sql`
            ALTER TABLE registrationData
            ADD COLUMN IF NOT EXISTS reference_code VARCHAR(4)
        `;

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

        } else if (table === "ambassadorStats") {
            data = await sql`
                WITH referred_people AS (
                    SELECT master.reference_code, LOWER(single_data.email) AS participant
                    FROM registrationData AS master
                    JOIN singleRegistrationData AS single_data
                      ON single_data.registration_id = master.id
                    WHERE master.ispaid = TRUE AND master.reference_code IS NOT NULL
                    UNION
                    SELECT master.reference_code, LOWER(member->>'email') AS participant
                    FROM registrationData AS master
                    JOIN teamRegistrationData AS team_data
                      ON team_data.registration_id = master.id
                    CROSS JOIN LATERAL JSONB_ARRAY_ELEMENTS(team_data.members) AS member
                    WHERE master.ispaid = TRUE AND master.reference_code IS NOT NULL
                )
                SELECT reference_code, COUNT(DISTINCT participant)::INTEGER AS participant_count
                FROM referred_people
                WHERE participant IS NOT NULL AND participant <> ''
                GROUP BY reference_code
            `;
        } else if (table === "uniqueParticipants") {

            data = await sql`
                WITH participant_events AS (
                    SELECT
                        single_data.registration_id,
                        single_data.name,
                        LOWER(single_data.email) AS normalized_email,
                        single_data.email,
                        single_data.phonenumber,
                        single_data.department,
                        single_data.university,
                        UNNEST(single_data.events) AS event,
                        single_data.created_at
                    FROM singleRegistrationData AS single_data

                    UNION ALL

                    SELECT
                        team_data.registration_id,
                        member->>'name' AS name,
                        LOWER(member->>'email') AS normalized_email,
                        member->>'email' AS email,
                        member->>'phoneNumber' AS phonenumber,
                        member->>'department' AS department,
                        member->>'university' AS university,
                        team_data.event,
                        team_data.created_at
                    FROM teamRegistrationData AS team_data
                    CROSS JOIN LATERAL JSONB_ARRAY_ELEMENTS(team_data.members) AS member
                ),
                registration_people AS (
                    SELECT
                        registration_id,
                        normalized_email,
                        (ARRAY_AGG(name ORDER BY created_at DESC))[1] AS name,
                        (ARRAY_AGG(email ORDER BY created_at DESC))[1] AS email,
                        (ARRAY_AGG(phonenumber ORDER BY created_at DESC))[1] AS phonenumber,
                        (ARRAY_AGG(department ORDER BY created_at DESC))[1] AS department,
                        (ARRAY_AGG(university ORDER BY created_at DESC))[1] AS university,
                        ARRAY_AGG(DISTINCT event ORDER BY event) AS events,
                        MAX(created_at) AS created_at
                    FROM participant_events
                    WHERE normalized_email IS NOT NULL AND normalized_email <> ''
                    GROUP BY registration_id, normalized_email
                ),
                newest_people AS (
                    SELECT *, ROW_NUMBER() OVER (
                        PARTITION BY normalized_email
                        ORDER BY created_at DESC, registration_id DESC
                    ) AS participant_rank
                    FROM registration_people
                )
                SELECT
                    newest_people.registration_id,
                    newest_people.name,
                    newest_people.email,
                    newest_people.phonenumber,
                    newest_people.department,
                    newest_people.university,
                    newest_people.events,
                    master.fee AS total_fee,
                    master.ispaid,
                    master.tran_id
                FROM newest_people
                JOIN registrationData AS master
                  ON master.id = newest_people.registration_id
                WHERE newest_people.participant_rank = 1
                ORDER BY newest_people.registration_id DESC, newest_people.name
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

        const errorMessage = error instanceof Error
            ? error.message
            : "Unknown database error";

        return NextResponse.json(
            {
                success: false,
                message: process.env.NODE_ENV === "development"
                    ? errorMessage
                    : "Server Error"
            },
            { status: 500 }
        );
    }
}
