import { createHmac, timingSafeEqual } from "node:crypto";

const getVerificationSecret = () =>
    process.env.PAYMENT_VERIFICATION_SECRET || process.env.ADMIN_PASSWORD || "";

export function createPaymentVerificationToken(transactionId: string) {
    const secret = getVerificationSecret();
    if (!secret) throw new Error("Payment verification secret is not configured.");
    return createHmac("sha256", secret).update(transactionId).digest("hex");
}

export function isValidPaymentVerificationToken(transactionId: string, token: string) {
    if (!transactionId || !token) return false;
    const expected = Buffer.from(createPaymentVerificationToken(transactionId));
    const provided = Buffer.from(token);
    return provided.length === expected.length && timingSafeEqual(provided, expected);
}

export function createPaymentVerificationUrl(
    transactionId: string,
    origin = process.env.NEXT_PUBLIC_SITE_URL || "https://www.constructcarnival.com",
) {
    const url = new URL("/verify-payment", origin);
    url.searchParams.set("transaction", transactionId);
    url.searchParams.set("token", createPaymentVerificationToken(transactionId));
    return url.toString();
}
