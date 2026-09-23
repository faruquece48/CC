import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { ambassadors } from "@/lib/ambassadors";
import { verifyParticipantQrToken, type QrPurpose } from "@/lib/participantQr";

let schemaPromise: Promise<unknown> | null = null;
function ensureSchema() {
  schemaPromise ||= Promise.all([
    sql`CREATE TABLE IF NOT EXISTS qrCollectionLog (
      normalized_email TEXT NOT NULL, registration_id BIGINT NOT NULL,
      purpose TEXT NOT NULL CHECK (purpose IN ('kit', 'lunch')),
      scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY (normalized_email, purpose)
    )`,
    sql`CREATE TABLE IF NOT EXISTS ambassadorQrCollectionLog (
      ambassador_code TEXT NOT NULL, normalized_email TEXT NOT NULL,
      purpose TEXT NOT NULL CHECK (purpose IN ('kit', 'lunch')),
      scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY (ambassador_code, purpose)
    )`,
  ]).catch((error) => { schemaPromise = null; throw error; });
  return schemaPromise;
}

async function collectionSummary() {
  const result = await sql`
    SELECT purpose, registration_id::TEXT identifier, scanned_at FROM qrCollectionLog
    UNION ALL
    SELECT purpose, ambassador_code identifier, scanned_at FROM ambassadorQrCollectionLog
    ORDER BY scanned_at DESC
  `;
  const kitRows = result.rows.filter((row) => row.purpose === "kit");
  const lunchRows = result.rows.filter((row) => row.purpose === "lunch");
  const identifier = (value: unknown) => /^\d+$/.test(String(value)) ? Number(value) : String(value);
  return {
    counts: { kit: kitRows.length, lunch: lunchRows.length },
    scanned: {
      kit: kitRows.map((row) => identifier(row.identifier)),
      lunch: lunchRows.map((row) => identifier(row.identifier)),
    },
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    await ensureSchema();

    if (body.action === "stats") {
      return NextResponse.json({ success: true, ...(await collectionSummary()) }, {
        headers: { "Cache-Control": "no-store" },
      });
    }
    if (body.action !== "redeem") {
      return NextResponse.json({ success: false, message: "Invalid action." }, { status: 400 });
    }

    const purpose = body.purpose as QrPurpose;
    if (purpose !== "kit" && purpose !== "lunch") {
      return NextResponse.json({ success: false, message: "Select kit or lunch collection." }, { status: 400 });
    }
    const payload = verifyParticipantQrToken(typeof body.token === "string" ? body.token : "");
    if (!payload) {
      return NextResponse.json({ success: false, code: "invalid", message: "Invalid or altered QR code." }, { status: 400 });
    }
    if (payload.purpose !== purpose) {
      return NextResponse.json({
        success: false,
        code: "wrong-purpose",
        message: `This is a ${payload.purpose} QR code. Switch to ${payload.purpose} collection mode.`,
      }, { status: 400 });
    }

    if (typeof payload.registrationId === "string") {
      const normalizedEmail = payload.email.trim().toLowerCase().replace(/\s+/g, "");
      const ambassador = ambassadors.find((item) => item.code === payload.registrationId
        && item.email.trim().toLowerCase().replace(/\s+/g, "") === normalizedEmail);
      if (!ambassador) return NextResponse.json({ success: false, code: "not-found", message: "Campus ambassador not found." }, { status: 404 });
      const redemption = await sql`INSERT INTO ambassadorQrCollectionLog (ambassador_code, normalized_email, purpose)
        VALUES (${ambassador.code}, ${normalizedEmail}, ${payload.purpose})
        ON CONFLICT (ambassador_code, purpose) DO NOTHING RETURNING scanned_at`;
      if (!redemption.rowCount) {
        const existing = await sql`SELECT scanned_at FROM ambassadorQrCollectionLog WHERE ambassador_code = ${ambassador.code} AND purpose = ${payload.purpose}`;
        return NextResponse.json({ success: false, code: "duplicate", message: `${payload.purpose === "kit" ? "Kit" : "Lunch"} was already collected for this campus ambassador.`, registrationId: ambassador.code, participantName: ambassador.name, scannedAt: existing.rows[0]?.scanned_at, ...(await collectionSummary()) }, { status: 409 });
      }
      return NextResponse.json({ success: true, message: `${payload.purpose === "kit" ? "Kit" : "Lunch"} collection recorded for campus ambassador.`, registrationId: ambassador.code, participantName: ambassador.name, ...(await collectionSummary()) }, { headers: { "Cache-Control": "no-store" } });
    }

    const participant = await sql`
      WITH paid_people AS (
        SELECT single_data.registration_id, single_data.name, single_data.email,
          LOWER(REGEXP_REPLACE(TRIM(single_data.email), '\s+', '', 'g')) AS normalized_email
        FROM singleRegistrationData AS single_data
        JOIN registrationData AS master ON master.id = single_data.registration_id
        WHERE master.ispaid = TRUE
        UNION ALL
        SELECT team_data.registration_id, member->>'name', member->>'email',
          LOWER(REGEXP_REPLACE(TRIM(member->>'email'), '\s+', '', 'g'))
        FROM teamRegistrationData AS team_data
        JOIN registrationData AS master ON master.id = team_data.registration_id
        CROSS JOIN LATERAL JSONB_ARRAY_ELEMENTS(team_data.members) AS member
        WHERE master.ispaid = TRUE
      )
      SELECT name, email FROM paid_people
      WHERE registration_id = ${payload.registrationId}
        AND normalized_email = ${payload.email}
      LIMIT 1
    `;
    if (!participant.rows[0]) {
      return NextResponse.json({ success: false, code: "not-found", message: "Paid participant not found." }, { status: 404 });
    }

    const redemption = await sql`
      INSERT INTO qrCollectionLog (normalized_email, registration_id, purpose)
      VALUES (${payload.email}, ${payload.registrationId}, ${payload.purpose})
      ON CONFLICT (normalized_email, purpose) DO NOTHING
      RETURNING scanned_at
    `;
    if (redemption.rowCount === 0) {
      const existing = await sql`
        SELECT scanned_at FROM qrCollectionLog
        WHERE normalized_email = ${payload.email} AND purpose = ${payload.purpose}
      `;
      return NextResponse.json({
        success: false,
        code: "duplicate",
        message: `${payload.purpose === "kit" ? "Kit" : "Lunch"} was already collected for this participant.`,
        registrationId: payload.registrationId,
        scannedAt: existing.rows[0]?.scanned_at,
        ...(await collectionSummary()),
      }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      message: `${payload.purpose === "kit" ? "Kit" : "Lunch"} collection recorded.`,
      registrationId: payload.registrationId,
      participantName: participant.rows[0].name,
      ...(await collectionSummary()),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("QR CHECK ERROR:", error);
    return NextResponse.json({
      success: false,
      message: process.env.NODE_ENV === "development" ? `Unable to check QR code: ${String(error)}` : "Unable to check this QR code.",
    }, { status: 500 });
  }
}