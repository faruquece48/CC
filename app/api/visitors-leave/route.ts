// app/api/visitors-leave/route.ts

import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const getRedis = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  return url && token ? new Redis({ url, token }) : null;
};

export async function POST(req: Request) {
  try {
    const redis = getRedis();

    if (!redis) {
      return NextResponse.json({ success: true });
    }

    const today = new Date().toISOString().slice(0, 10);

    let sessionId: string | null = null;

    try {
      const body = await req.json();
      sessionId = body?.sessionId ?? null;
    } catch {}

    if (!sessionId) {
      return NextResponse.json({ success: true });
    }

    const liveKey = `visitors:live:${today}:${sessionId}`;

    await redis.del(liveKey);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Visitor leave error:", error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
