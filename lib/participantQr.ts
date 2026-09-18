import { createHmac, timingSafeEqual } from "node:crypto";

export type QrPurpose = "kit" | "lunch";

type ParticipantQrPayload = {
  version: 1;
  registrationId: number;
  email: string;
  purpose: QrPurpose;
};

function secret() {
  const value = process.env.QR_CODE_SECRET || process.env.ADMIN_PASSWORD;
  if (!value && process.env.NODE_ENV !== "development") {
    throw new Error("QR_CODE_SECRET or ADMIN_PASSWORD must be configured.");
  }
  return value || "local-development-qr-secret";
}

function signature(encodedPayload: string) {
  return createHmac("sha256", secret()).update(encodedPayload).digest("base64url");
}

export function createParticipantQrToken(payload: Omit<ParticipantQrPayload, "version">) {
  const compactPayload = { v: 1, r: payload.registrationId, e: payload.email, p: payload.purpose };
  const encodedPayload = Buffer.from(JSON.stringify(compactPayload)).toString("base64url");
  return `${encodedPayload}.${signature(encodedPayload)}`;
}

export function verifyParticipantQrToken(token: string): ParticipantQrPayload | null {
  const [encodedPayload, providedSignature, extra] = token.split(".");
  if (!encodedPayload || !providedSignature || extra) return null;
  const expectedSignature = signature(encodedPayload);
  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;
  try {
    const decoded = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    const payload = decoded.v === 1
      ? { version: 1, registrationId: decoded.r, email: decoded.e, purpose: decoded.p }
      : decoded;
    if (payload.version !== 1
      || !Number.isInteger(payload.registrationId)
      || typeof payload.email !== "string"
      || (payload.purpose !== "kit" && payload.purpose !== "lunch")) return null;
    return payload as ParticipantQrPayload;
  } catch {
    return null;
  }
}