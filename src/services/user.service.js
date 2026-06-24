import prisma from "../lib/db.js";
import { NotFoundError } from "../errors/httpErrors.js";

export async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      tier: true,
      premiumExpiresAt: true,
      createdAt: true,
    },
  });
  if (!user) throw new NotFoundError("User not found");

  const isPremiumExpired =
    user.tier === "PREMIUM" && user.premiumExpiresAt && user.premiumExpiresAt < new Date();

  if (isPremiumExpired) {
    await prisma.user.update({
      where: { id: userId },
      data: { tier: "FREE", premiumExpiresAt: null },
    });
    user.tier = "FREE";
    user.premiumExpiresAt = null;
  }

  return user;
}
