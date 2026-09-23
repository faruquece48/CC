import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { verifyParticipantQrToken } from "@/lib/participantQr";
import { ambassadors } from "@/lib/ambassadors";

export async function GET(request: Request) {
  try {
    const token = new URL(request.url).searchParams.get("token") || "";
    const payload = verifyParticipantQrToken(token);
    if (!payload) return NextResponse.json({ valid: false, message: "Invalid QR code." }, { status: 400 });
    if (typeof payload.registrationId === "string") {
      const normalizedEmail = payload.email.trim().toLowerCase().replace(/\s+/g, "");
      const ambassador = ambassadors.find((item) => item.code === payload.registrationId
        && item.email.trim().toLowerCase().replace(/\s+/g, "") === normalizedEmail);
      if (!ambassador) return NextResponse.json({ valid: false, message: "Campus ambassador not found." }, { status: 404 });
      return NextResponse.json({ valid: true, purpose: payload.purpose, registrationId: ambassador.code, participantName: ambassador.name, isAmbassador: true }, { headers: { "Cache-Control": "no-store" } });
    }
    const result = await sql`
      WITH paid_people AS (
        SELECT single_data.registration_id,
          LOWER(REGEXP_REPLACE(TRIM(single_data.email), '\s+', '', 'g')) AS normalized_email
        FROM singleRegistrationData AS single_data
        JOIN registrationData AS master ON master.id = single_data.registration_id
        WHERE master.ispaid = TRUE
        UNION ALL
        SELECT team_data.registration_id,
          LOWER(REGEXP_REPLACE(TRIM(member->>'email'), '\s+', '', 'g'))
        FROM teamRegistrationData AS team_data
        JOIN registrationData AS master ON master.id = team_data.registration_id
        CROSS JOIN LATERAL JSONB_ARRAY_ELEMENTS(team_data.members) AS member
        WHERE master.ispaid = TRUE
      )
      SELECT 1 FROM paid_people
      WHERE registration_id = ${payload.registrationId}
        AND normalized_email = ${payload.email}
      LIMIT 1
    `;
    if (!result.rows[0]) return NextResponse.json({ valid: false, message: "Paid participant not found." }, { status: 404 });
    return NextResponse.json({ valid: true, purpose: payload.purpose, registrationId: payload.registrationId }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("QR VERIFY ERROR:", error);
    return NextResponse.json({ valid: false, message: "Unable to verify this QR code." }, { status: 500 });
  }
}