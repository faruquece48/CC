import { createHmac, timingSafeEqual } from "node:crypto";

function secret() {
  const value = process.env.CERTIFICATE_SECRET || process.env.QR_CODE_SECRET || process.env.ADMIN_PASSWORD;
  if (!value && process.env.NODE_ENV !== "development") throw new Error("Certificate verification secret is not configured.");
  return value || "local-certificate-secret";
}

function signature(value: string) {
  return createHmac("sha256", secret()).update(value).digest().subarray(0, 12).toString("base64url");
}

export function createParticipationCertificateToken(registrationId: number, certificateId: string) {
  const payload = `${registrationId}.${certificateId}`;
  return `${payload}.${signature(payload)}`;
}

export function verifyParticipationCertificateToken(token: string) {
  const [registrationIdText, certificateId, supplied, extra] = token.split(".");
  const registrationId = Number(registrationIdText);
  if (!Number.isInteger(registrationId) || registrationId <= 0 || !/^CC2-P-[A-Z0-9]{7}$/.test(certificateId || "") || !supplied || extra) return null;
  const payload = `${registrationIdText}.${certificateId}`;
  const expected = signature(payload);
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);
  return suppliedBuffer.length === expectedBuffer.length && timingSafeEqual(suppliedBuffer, expectedBuffer)
    ? { registrationId, certificateId }
    : null;
}
