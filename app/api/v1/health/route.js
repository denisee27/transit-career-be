import { NextResponse } from "next/server";
import prisma from "@/src/lib/db.js";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      db: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { status: "error", db: "disconnected", message: err.message },
      { status: 503 }
    );
  }
}
