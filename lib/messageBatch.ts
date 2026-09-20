export type MessageBatch = {
  id?: string;
  subject: string;
  message: string;
  includeSchedule: boolean;
  remaining: string[];
  sent: number;
  sendingEmail?: string | null;
};

export function isMessageBatch(value: unknown): value is MessageBatch {
  if (!value || typeof value !== "object") return false;
  const batch = value as MessageBatch;
  return typeof batch.subject === "string" && !!batch.subject.trim() && batch.subject.length <= 200
    && typeof batch.message === "string" && !!batch.message.trim() && batch.message.length <= 10_000
    && typeof batch.includeSchedule === "boolean"
    && Number.isSafeInteger(batch.sent) && batch.sent >= 0
    && Array.isArray(batch.remaining) && batch.remaining.length <= 10_000
    && batch.remaining.every((email) => typeof email === "string" && /^[^\s@]+@[^\s@]+$/.test(email))
    && new Set(batch.remaining).size === batch.remaining.length;
}
