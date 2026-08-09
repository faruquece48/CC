import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "cc_admin_session";

export function createAdminSessionToken() {
    const password = process.env.ADMIN_PASSWORD;
    if (!password) return "";
    return createHmac("sha256", password)
        .update("construct-carnival-admin-session")
        .digest("hex");
}

export function isValidAdminSession(token?: string) {
    if (!token) return false;
    const expected = Buffer.from(createAdminSessionToken());
    const provided = Buffer.from(token);
    return expected.length > 0 &&
        provided.length === expected.length &&
        timingSafeEqual(provided, expected);
}
