import { sql } from "@vercel/postgres";
import { isMessageBatch, type MessageBatch } from "./messageBatch";

let schemaPromise: Promise<unknown> | null = null;
export function ensureMessageBatchSchema() {
  schemaPromise ||= sql`
    CREATE TABLE IF NOT EXISTS participantMessageBatch (
      id UUID PRIMARY KEY,
      data JSONB NOT NULL,
      sending_email TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `.catch((error) => { schemaPromise = null; throw error; });
  return schemaPromise;
}

function batchFromRow(row: Record<string, any>): MessageBatch {
  return { ...row.data, id: row.id, sendingEmail: row.sending_email };
}

export function validBatchId(id: unknown): id is string {
  return typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export async function loadMessageBatch(id?: string) {
  await ensureMessageBatchSchema();
  const result = id
    ? await sql`SELECT * FROM participantMessageBatch WHERE id = ${id}::uuid`
    : await sql`SELECT * FROM participantMessageBatch ORDER BY created_at DESC LIMIT 1`;
  return result.rows[0] ? batchFromRow(result.rows[0]) : null;
}

export async function importMessageBatch(batch: MessageBatch) {
  if (!validBatchId(batch.id) || !isMessageBatch(batch)) throw new Error("Invalid saved batch.");
  await ensureMessageBatchSchema();
  // Import once. A stale browser must never overwrite server delivery progress.
  const data = JSON.stringify({ subject: batch.subject, message: batch.message,
    includeSchedule: batch.includeSchedule, remaining: batch.remaining, sent: batch.sent });
  await sql`INSERT INTO participantMessageBatch (id, data) VALUES (${batch.id}::uuid, ${data}::jsonb)
    ON CONFLICT (id) DO NOTHING`;
  return (await loadMessageBatch(batch.id))!;
}

export async function claimMessageRecipient(id: string, email: string) {
  const result = await sql`UPDATE participantMessageBatch SET sending_email = ${email}, updated_at = NOW()
    WHERE id = ${id}::uuid AND sending_email IS NULL AND data->'remaining' ? ${email}
    RETURNING id`;
  return result.rowCount === 1;
}

export async function finishMessageRecipient(id: string, email: string, sent: boolean, review = false) {
  let result;
  if (sent) {
    result = await sql`UPDATE participantMessageBatch SET
      data = jsonb_set(jsonb_set(data, '{remaining}', (data->'remaining') - ${email}),
        '{sent}', to_jsonb((data->>'sent')::integer + 1)),
      sending_email = NULL, updated_at = NOW()
      WHERE id = ${id}::uuid AND sending_email = ${email}
        AND (${review} = FALSE OR updated_at < NOW() - INTERVAL '5 minutes')`;
  } else {
    result = await sql`UPDATE participantMessageBatch SET sending_email = NULL, updated_at = NOW()
      WHERE id = ${id}::uuid AND sending_email = ${email}
        AND (${review} = FALSE OR updated_at < NOW() - INTERVAL '5 minutes')`;
  }
  if (!result.rowCount) throw new Error("Delivery is still in progress or was already reviewed. Wait five minutes, then reload the online batch.");
  return loadMessageBatch(id);
}
