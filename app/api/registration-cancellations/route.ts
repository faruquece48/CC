import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

const auth = (value: unknown) => {
  const provided = Buffer.from(typeof value === "string" ? value : "");
  const expected = Buffer.from(process.env.ADMIN_PASSWORD || "");
  return Boolean(process.env.ADMIN_PASSWORD) && provided.length === expected.length && timingSafeEqual(provided, expected);
};

async function ensureSchema() {
  await sql`CREATE TABLE IF NOT EXISTS cancelledRegistrationData (registration_id BIGINT PRIMARY KEY, registration_data JSONB NOT NULL, cancelled_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS cancelledSingleRegistrationData (original_id BIGINT PRIMARY KEY, registration_id BIGINT NOT NULL, registration_data JSONB NOT NULL, cancelled_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS cancelledTeamRegistrationData (original_id BIGINT PRIMARY KEY, registration_id BIGINT NOT NULL, registration_data JSONB NOT NULL, cancelled_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS qrCollectionLog (normalized_email TEXT NOT NULL, registration_id BIGINT NOT NULL, purpose TEXT NOT NULL CHECK (purpose IN ('kit', 'lunch')), scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY (normalized_email, purpose))`;
  await sql`CREATE TABLE IF NOT EXISTS paymentEmailLog (tran_id TEXT PRIMARY KEY, registration_id BIGINT NOT NULL, recipient TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'sent', sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS certificateEmailLog (normalized_email TEXT PRIMARY KEY, registration_id BIGINT NOT NULL, participant_name TEXT NOT NULL, recipient TEXT NOT NULL, certificate_id TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'sending', sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
}

async function listCancellations() {
  const [individual, teams] = await Promise.all([
    sql`SELECT c.registration_id, c.cancelled_at, c.registration_data->>'name' name, c.registration_data->>'email' email, c.registration_data->>'phonenumber' phonenumber, c.registration_data->>'department' department, c.registration_data->>'university' university, c.registration_data->'events' events, COALESCE((m.registration_data->>'fee')::numeric, 0) fee, m.registration_data->>'tran_id' tran_id, COALESCE((m.registration_data->>'ispaid')::boolean, FALSE) was_paid FROM cancelledSingleRegistrationData c JOIN cancelledRegistrationData m USING (registration_id) ORDER BY c.cancelled_at DESC, c.registration_id DESC`,
    sql`SELECT c.registration_id, c.cancelled_at, c.registration_data->>'event' event, c.registration_data->>'teamname' teamname, c.registration_data->>'delivery_address' delivery_address, c.registration_data->'members' members, COALESCE((m.registration_data->>'fee')::numeric, 0) fee, m.registration_data->>'tran_id' tran_id, COALESCE((m.registration_data->>'ispaid')::boolean, FALSE) was_paid FROM cancelledTeamRegistrationData c JOIN cancelledRegistrationData m USING (registration_id) ORDER BY c.cancelled_at DESC, c.registration_id DESC`,
  ]);
  return { individual: individual.rows, teams: teams.rows };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!auth(body.password)) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    await ensureSchema();
    if (body.action === "list") return NextResponse.json({ success: true, ...(await listCancellations()) });
    if (body.action !== "cancel") return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
    const id = Number(body.registrationId);
    if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ success: false, message: "Invalid registration ID" }, { status: 400 });
    const result = await sql`WITH target AS (SELECT * FROM registrationData WHERE id = ${id}),
      am AS (INSERT INTO cancelledRegistrationData (registration_id, registration_data) SELECT id, TO_JSONB(target) FROM target ON CONFLICT (registration_id) DO NOTHING RETURNING registration_id),
      asi AS (INSERT INTO cancelledSingleRegistrationData (original_id, registration_id, registration_data) SELECT s.id, s.registration_id, TO_JSONB(s) FROM singleRegistrationData s JOIN am ON am.registration_id=s.registration_id ON CONFLICT (original_id) DO NOTHING RETURNING registration_id),
      ate AS (INSERT INTO cancelledTeamRegistrationData (original_id, registration_id, registration_data) SELECT t.id, t.registration_id, TO_JSONB(t) FROM teamRegistrationData t JOIN am ON am.registration_id=t.registration_id ON CONFLICT (original_id) DO NOTHING RETURNING registration_id),
      dq AS (DELETE FROM qrCollectionLog WHERE registration_id IN (SELECT registration_id FROM am)),
      dp AS (DELETE FROM paymentEmailLog WHERE registration_id IN (SELECT registration_id FROM am)),
      dc AS (DELETE FROM certificateEmailLog WHERE registration_id IN (SELECT registration_id FROM am)),
      ds AS (DELETE FROM singleRegistrationData WHERE registration_id IN (SELECT registration_id FROM am)),
      dt AS (DELETE FROM teamRegistrationData WHERE registration_id IN (SELECT registration_id FROM am))
      DELETE FROM registrationData WHERE id IN (SELECT registration_id FROM am) RETURNING id`;
    if (!result.rowCount) {
      const old = await sql`SELECT 1 FROM cancelledRegistrationData WHERE registration_id = ${id}`;
      return NextResponse.json({ success: false, message: old.rowCount ? "This registration is already canceled." : "Registration ID not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: `Registration ${id} was canceled and removed from all active pages.`, ...(await listCancellations()) });
  } catch (error) {
    console.error("REGISTRATION CANCELLATION ERROR:", error);
    return NextResponse.json({ success: false, message: "Unable to cancel this registration." }, { status: 500 });
  }
}
