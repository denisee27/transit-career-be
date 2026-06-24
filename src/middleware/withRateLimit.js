import { NextResponse } from "next/server";

const requestCounts = new Map();

export function withRateLimit(handler, { limit = 60, windowMs = 60000 } = {}) {
  return async function (request, context) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";
    const pathname = request.nextUrl?.pathname ?? "/";
    const key = `${ip}:${pathname}`;
    const now = Date.now();

    const entry = requestCounts.get(key) ?? { count: 0, resetAt: now + windowMs };

    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + windowMs;
    }

    entry.count++;
    requestCounts.set(key, entry);

    if (entry.count > limit) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please slow down." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(entry.resetAt / 1000)),
            "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)),
          },
        }
      );
    }

    return handler(request, context);
  };
}
