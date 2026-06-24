import { randomBytes } from "crypto";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import prisma from "../lib/db.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/auth.js";
import { sendMagicLinkEmail } from "../lib/mailer.js";
import { env } from "../config/index.js";
import { UnauthorizedError, ConflictError, BadRequestError } from "../errors/httpErrors.js";

const BCRYPT_ROUNDS = 12;

export async function register(email, password, name, deviceInfo) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ConflictError("An account with this email already exists");

  const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await prisma.user.create({ data: { email, password: hashed, name } });

  return createTokensForUser(user, deviceInfo);
}

export async function loginWithPassword(email, password, deviceInfo) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.password) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new UnauthorizedError("Invalid email or password");

  return createTokensForUser(user, deviceInfo);
}

const MAX_SESSIONS = 2;
const MAGIC_LINK_EXPIRY_MINUTES = 15;
const REFRESH_TOKEN_EXPIRY_DAYS = 30;

export async function sendMagicLink(email) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY_MINUTES * 60 * 1000);

  await prisma.magicLink.create({ data: { email, token, expiresAt } });

  const magicLink = `${env.FRONTEND_URL}/auth/verify?token=${token}`;
  await sendMagicLinkEmail(email, magicLink);

  return { message: "Magic link sent to your email" };
}

export async function verifyMagicLink(token, deviceInfo) {
  const link = await prisma.magicLink.findUnique({ where: { token } });

  if (!link || link.used || link.expiresAt < new Date()) {
    throw new UnauthorizedError("Magic link is invalid or has expired");
  }

  await prisma.magicLink.update({ where: { id: link.id }, data: { used: true } });

  let user = await prisma.user.findUnique({ where: { email: link.email } });
  if (!user) {
    user = await prisma.user.create({ data: { email: link.email } });
  }

  return createTokensForUser(user, deviceInfo);
}

export async function handleGoogleCallback(code, deviceInfo) {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) throw new UnauthorizedError("Failed to exchange Google authorization code");

  const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const profile = await profileRes.json();

  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId: profile.id }, { email: profile.email }] },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name,
        avatar: profile.picture,
        googleId: profile.id,
      },
    });
  } else if (!user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleId: profile.id, name: profile.name, avatar: profile.picture },
    });
  }

  return createTokensForUser(user, deviceInfo);
}

export async function refreshTokens(refreshToken, deviceInfo) {
  const payload = verifyRefreshToken(refreshToken);

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.expiresAt < new Date()) {
    throw new UnauthorizedError("Refresh token is expired or not found");
  }

  await prisma.refreshToken.delete({ where: { id: stored.id } });

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) throw new UnauthorizedError("User not found");

  return createTokensForUser(user, deviceInfo);
}

export async function logout(userId, refreshToken) {
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken, userId } });
  }
  return { message: "Logged out successfully" };
}

async function createTokensForUser(user, deviceInfo) {
  const sessions = await prisma.session.findMany({
    where: { userId: user.id },
    orderBy: { lastActive: "asc" },
  });

  if (sessions.length >= MAX_SESSIONS) {
    const oldest = sessions[0];
    await prisma.session.delete({ where: { id: oldest.id } });
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id, deviceInfo: oldest.deviceInfo },
    });
  }

  const sessionId = uuidv4();
  await prisma.session.create({ data: { id: sessionId, userId: user.id, deviceInfo } });

  const accessToken = signAccessToken({ userId: user.id, tier: user.tier, sessionId });
  const newRefreshToken = signRefreshToken({ userId: user.id, sessionId });

  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
  );
  await prisma.refreshToken.create({
    data: { token: newRefreshToken, userId: user.id, deviceInfo, expiresAt },
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      tier: user.tier,
      premiumExpiresAt: user.premiumExpiresAt,
    },
  };
}
