import { sql } from "@vercel/postgres";

const target = (process.argv[2] || "all").toLowerCase();
if (!new Set(["all", "kit", "lunch"]).has(target)) {
  throw new Error("Usage: node scripts/reset-qrcheck.mjs [all|kit|lunch]");
}

await Promise.all([
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
]);
const [removedParticipants, removedAmbassadors] = await Promise.all([
  target === "all" ? sql`DELETE FROM qrCollectionLog RETURNING purpose` : sql.query("DELETE FROM qrCollectionLog WHERE purpose = $1 RETURNING purpose", [target]),
  target === "all" ? sql`DELETE FROM ambassadorQrCollectionLog RETURNING purpose` : sql.query("DELETE FROM ambassadorQrCollectionLog WHERE purpose = $1 RETURNING purpose", [target]),
]);
const remaining = await sql`
  SELECT purpose, COUNT(*)::INTEGER AS count FROM (
    SELECT purpose FROM qrCollectionLog UNION ALL SELECT purpose FROM ambassadorQrCollectionLog
  ) scans GROUP BY purpose
`;
console.log(JSON.stringify({
  reset: target,
  removed: removedParticipants.rowCount + removedAmbassadors.rowCount,
  kit: Number(remaining.rows.find((row) => row.purpose === "kit")?.count || 0),
  lunch: Number(remaining.rows.find((row) => row.purpose === "lunch")?.count || 0),
}));