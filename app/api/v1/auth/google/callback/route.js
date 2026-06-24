import { NextResponse } from "next/server";
import { handleGoogleCallback } from "../../../../../../src/services/auth.service.js";
import { env } from "../../../../../../src/config/index.js";

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${env.FRONTEND_URL}/login?error=oauth_cancelled`);
  }

  try {
    const deviceInfo = request.headers.get("user-agent") ?? "unknown";
    const result = await handleGoogleCallback(code, deviceInfo);

    const params = new URLSearchParams({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    return NextResponse.redirect(`${env.FRONTEND_URL}/auth/callback?${params.toString()}`);
  } catch {
    return NextResponse.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
  }
}
