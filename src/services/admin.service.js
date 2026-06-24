import prisma from "../lib/db.js";

export async function getAnalytics() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalUsers, totalPremium, revenueData] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.count({ where: { tier: "PREMIUM" } }),
    prisma.payment.aggregate({
      where: { status: "SUCCESS", paidAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalUsers,
    totalPremium,
    monthlyRevenue: revenueData._sum.amount ?? 0,
  };
}

export async function listUsers({ page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        tier: true,
        premiumExpiresAt: true,
        createdAt: true,
      },
    }),
    prisma.user.count(),
  ]);

  return { users, meta: { total, page, totalPages: Math.ceil(total / limit) } };
}
