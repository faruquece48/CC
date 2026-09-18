import { sql } from "@vercel/postgres";

await sql`
  CREATE TABLE IF NOT EXISTS qrCollectionLog (
    normalized_email TEXT NOT NULL,
    registration_id BIGINT NOT NULL,
    purpose TEXT NOT NULL CHECK (purpose IN ('kit', 'lunch')),
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (normalized_email, purpose)
  )
`;
const removed = await sql`DELETE FROM qrCollectionLog RETURNING purpose`;
const remaining = await sql`
  SELECT purpose, COUNT(*)::INTEGER AS count
  FROM qrCollectionLog
  GROUP BY purpose
`;
console.log(JSON.stringify({
  removed: removed.rowCount,
  kit: Number(remaining.rows.find((row) => row.purpose === "kit")?.count || 0),
  lunch: Number(remaining.rows.find((row) => row.purpose === "lunch")?.count || 0),
}));