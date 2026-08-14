import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await sql`
      WITH paid_participants AS (
        SELECT LOWER(TRIM(s.email)) AS email, TRIM(s.university) AS university
        FROM singleRegistrationData s
        JOIN registrationData r ON r.id = s.registration_id
        WHERE r.ispaid = TRUE AND TRIM(s.email) <> ''

        UNION ALL

        SELECT LOWER(TRIM(member->>'email')), TRIM(member->>'university')
        FROM teamRegistrationData t
        JOIN registrationData r ON r.id = t.registration_id
        CROSS JOIN LATERAL jsonb_array_elements(t.members) AS member
        WHERE r.ispaid = TRUE AND TRIM(member->>'email') <> ''

        UNION ALL

        SELECT LOWER(TRIM(email)), TRIM(university)
        FROM registrationData
        WHERE ispaid = TRUE AND TRIM(email) <> ''

        UNION ALL

        SELECT LOWER(TRIM(member_2_email)), TRIM(member_2_university)
        FROM registrationData
        WHERE ispaid = TRUE AND TRIM(member_2_email) <> ''

        UNION ALL

        SELECT LOWER(TRIM(member_3_email)), TRIM(member_3_university)
        FROM registrationData
        WHERE ispaid = TRUE AND TRIM(member_3_email) <> ''
      ),
      unique_participants AS (
        SELECT email, MAX(NULLIF(university, '')) AS university
        FROM paid_participants
        GROUP BY email
      )
      SELECT
        COUNT(*)::int AS participants,
        (COUNT(DISTINCT LOWER(university)) FILTER (WHERE university IS NOT NULL))::int AS universities
      FROM unique_participants
    `;

    return NextResponse.json(result.rows[0], {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (error) {
    console.error("REGISTRATION STATS ERROR:", error);
    return NextResponse.json(
      { participants: 0, universities: 0 },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
