import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, createAdminSessionToken } from "@/lib/adminSession";

export async function POST(request: Request) {
    const { password } = await request.json();
    const expectedPassword = process.env.ADMIN_PASSWORD;
    const provided = Buffer.from(typeof password === "string" ? password : "");
    const expected = Buffer.from(expectedPassword || "");

    if (
        typeof password !== "string" ||
        !expectedPassword ||
        provided.length !== expected.length ||
        !timingSafeEqual(provided, expected)
    ) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401, headers: { "Cache-Control": "no-store" } },
        );
    }

    const response = NextResponse.json(
        { success: true },
        { headers: { "Cache-Control": "no-store" } },
    );
    response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(), {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60,
        path: "/",
    });
    return response;
}
