// app/api/visitors/route.ts

import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function POST(req: Request) {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const totalKey = "visitors:total";
    const todayKey = `visitors:today:${today}`;

    const sessionId = req.headers.get("x-session-id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session ID" },
        { status: 400 }
      );
    }

    // Unique visitor key
    const sessionKey = `visitors:session:${today}:${sessionId}`;

    // Live visitor key
    const liveKey = `visitors:live:${today}:${sessionId}`;

    // Check if already counted today
    const alreadyCounted = await redis.exists(sessionKey);

    const pipeline = redis.pipeline();

    // Count unique visitor only once
    if (!alreadyCounted) {
      pipeline.incr(totalKey);
      pipeline.incr(todayKey);

      pipeline.set(sessionKey, 1, {
        ex: 86400,
      });

      pipeline.expire(todayKey, 172800);
    }

    // Refresh live visitor TTL
    pipeline.set(liveKey, 1, {
      ex: 60,
    });

    await pipeline.exec();

    // Get counts
    const [total, todayCount] = await Promise.all([
      redis.get<number>(totalKey),
      redis.get<number>(todayKey),
    ]);

    // Count live sessions dynamically
    const liveKeys = await redis.keys(`visitors:live:${today}:*`);

    return NextResponse.json({
      total: total ?? 0,
      todayCount: todayCount ?? 0,
      current: liveKeys.length,
    });
  } catch (error) {
    console.error("Visitor POST error:", error);

    return NextResponse.json(
      {
        total: 0,
        todayCount: 0,
        current: 0,
      },
      { status: 500 }
    );
  }
}