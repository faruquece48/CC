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
                WITH raw_referred_people AS (
                    SELECT master.reference_code, LOWER(single_data.email) AS participant,
                           single_data.created_at AS referred_at
                    FROM registrationData AS master
                    JOIN singleRegistrationData AS single_data
                      ON single_data.registration_id = master.id
                    WHERE master.ispaid = TRUE AND master.reference_code IS NOT NULL
                    UNION ALL
                    SELECT master.reference_code, LOWER(member->>'email') AS participant,
                           team_data.created_at AS referred_at
                    FROM registrationData AS master
                    JOIN teamRegistrationData AS team_data
                      ON team_data.registration_id = master.id
                    CROSS JOIN LATERAL JSONB_ARRAY_ELEMENTS(team_data.members) AS member
                    WHERE master.ispaid = TRUE AND master.reference_code IS NOT NULL
                ),
                referred_people AS (
                    SELECT reference_code, participant, MIN(referred_at) AS first_referred_at
                    FROM raw_referred_people
                    WHERE participant IS NOT NULL AND participant <> ''
                    GROUP BY reference_code, participant
                )
                SELECT reference_code,
                       COUNT(*)::INTEGER AS participant_count,
                       MAX(first_referred_at) AS reached_total_at
                FROM referred_people
                GROUP BY reference_code
            `;
        } else if (table === "uniqueParticipants") {

            data = await sql`
                WITH participant_events AS (
                    SELECT
                        single_data.registration_id,
                        single_data.name,
                        LOWER(REGEXP_REPLACE(TRIM(single_data.email), '\s+', '', 'g')) AS normalized_email,
                        single_data.email,
                        single_data.phonenumber,
                        single_data.department,
                        single_data.university,
                        UNNEST(single_data.events) AS event,
                        single_data.created_at,
                        master.fee AS total_fee,
                        master.ispaid,
                        master.tran_id
                    FROM singleRegistrationData AS single_data
                    JOIN registrationData AS master
                      ON master.id = single_data.registration_id

                    UNION ALL

                    SELECT
                        team_data.registration_id,
                        member->>'name' AS name,
                        LOWER(REGEXP_REPLACE(TRIM(member->>'email'), '\s+', '', 'g')) AS normalized_email,
                        member->>'email' AS email,
                        member->>'phoneNumber' AS phonenumber,
                        member->>'department' AS department,
                        member->>'university' AS university,
                        team_data.event,
                        team_data.created_at,
                        master.fee AS total_fee,
                        master.ispaid,
                        master.tran_id
                    FROM teamRegistrationData AS team_data
                    JOIN registrationData AS master
                      ON master.id = team_data.registration_id
                    CROSS JOIN LATERAL JSONB_ARRAY_ELEMENTS(team_data.members) AS member
                ),
                unique_people AS (
                    SELECT
                        normalized_email,
                        (ARRAY_AGG(registration_id ORDER BY ispaid DESC, created_at DESC, registration_id DESC))[1] AS registration_id,
                        (ARRAY_AGG(name ORDER BY ispaid DESC, created_at DESC, registration_id DESC))[1] AS name,
                        (ARRAY_AGG(email ORDER BY ispaid DESC, created_at DESC, registration_id DESC))[1] AS email,
                        (ARRAY_AGG(phonenumber ORDER BY ispaid DESC, created_at DESC, registration_id DESC))[1] AS phonenumber,
                        (ARRAY_AGG(department ORDER BY ispaid DESC, created_at DESC, registration_id DESC))[1] AS department,
                        (ARRAY_AGG(university ORDER BY ispaid DESC, created_at DESC, registration_id DESC))[1] AS university,
                        ARRAY_AGG(DISTINCT event ORDER BY event) AS events,
                        (ARRAY_AGG(total_fee ORDER BY ispaid DESC, created_at DESC, registration_id DESC))[1] AS total_fee,
                        BOOL_OR(ispaid) AS ispaid,
                        (ARRAY_AGG(tran_id ORDER BY ispaid DESC, created_at DESC, registration_id DESC))[1] AS tran_id
                    FROM participant_events
                    WHERE normalized_email IS NOT NULL AND normalized_email <> ''
                    GROUP BY normalized_email
                )
                SELECT
                    registration_id, name, email, phonenumber, department,
                    university, events, total_fee, ispaid, tran_id
                FROM unique_people
                ORDER BY registration_id DESC, name
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
        return NextResponse.json(
            {
                success: true,
                data: data.rows
            },
            {
                headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
            }
        );

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
