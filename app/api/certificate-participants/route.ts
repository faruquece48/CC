import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

function authorized(password: unknown) {
  const provided = Buffer.from(typeof password === "string" ? password : "");
  const expected = Buffer.from(process.env.ADMIN_PASSWORD || "");
  return Boolean(process.env.ADMIN_PASSWORD) && provided.length === expected.length && timingSafeEqual(provided, expected);
}

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    if (!authorized(password)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

  const result = await sql`
    WITH participant_events AS (
      SELECT single_data.registration_id, single_data.name,
        LOWER(TRIM(single_data.email)) AS normalized_email, single_data.email,
        UNNEST(single_data.events) AS event, single_data.created_at
      FROM singleRegistrationData AS single_data

      UNION ALL

      SELECT team_data.registration_id, member->>'name' AS name,
        LOWER(TRIM(member->>'email')) AS normalized_email, member->>'email' AS email,
        team_data.event, team_data.created_at
      FROM teamRegistrationData AS team_data
      CROSS JOIN LATERAL JSONB_ARRAY_ELEMENTS(team_data.members) AS member
    ), unique_people AS (
      SELECT normalized_email,
        (ARRAY_AGG(registration_id ORDER BY created_at DESC, registration_id DESC))[1] AS registration_id,
        (ARRAY_AGG(name ORDER BY created_at DESC, registration_id DESC))[1] AS name,
        (ARRAY_AGG(email ORDER BY created_at DESC, registration_id DESC))[1] AS email,
        ARRAY_AGG(DISTINCT event ORDER BY event) AS events
      FROM participant_events
      WHERE normalized_email IS NOT NULL AND normalized_email <> ''
      GROUP BY normalized_email
    )
    SELECT unique_people.*,
      (log.status = 'sent') AS certificate_sent,
      log.sent_at AS certificate_sent_at
    FROM unique_people
    LEFT JOIN certificateEmailLog AS log ON log.normalized_email = unique_people.normalized_email
    ORDER BY unique_people.name, unique_people.email
  `.catch(async (error) => {
    if (!String(error).includes("certificateemaillog")) throw error;
    return sql`
      WITH participant_events AS (
        SELECT single_data.registration_id, single_data.name,
          LOWER(TRIM(single_data.email)) AS normalized_email, single_data.email,
          UNNEST(single_data.events) AS event, single_data.created_at
        FROM singleRegistrationData AS single_data
        UNION ALL
        SELECT team_data.registration_id, member->>'name', LOWER(TRIM(member->>'email')), member->>'email',
          team_data.event, team_data.created_at
        FROM teamRegistrationData AS team_data
        CROSS JOIN LATERAL JSONB_ARRAY_ELEMENTS(team_data.members) AS member
      )
      SELECT
        (ARRAY_AGG(registration_id ORDER BY created_at DESC, registration_id DESC))[1] AS registration_id,
        (ARRAY_AGG(name ORDER BY created_at DESC, registration_id DESC))[1] AS name,
        (ARRAY_AGG(email ORDER BY created_at DESC, registration_id DESC))[1] AS email,
        normalized_email, ARRAY_AGG(DISTINCT event ORDER BY event) AS events,
        FALSE AS certificate_sent, NULL::TIMESTAMPTZ AS certificate_sent_at
      FROM participant_events
      WHERE normalized_email IS NOT NULL AND normalized_email <> ''
      GROUP BY normalized_email
      ORDER BY name, email
    `;
  });

    return NextResponse.json({ success: true, participants: result.rows }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("CERTIFICATE PARTICIPANTS ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Unable to connect to the participant database. Check the local server's database connection and retry.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
