import prisma from "../lib/db.js";
import { NotFoundError } from "../errors/httpErrors.js";

const USD_TO_IDR = 16200;

export async function getSalaryRange({ category, level, region }) {
  const range = await prisma.salaryRange.findFirst({ where: { category, level, region } });
  if (!range) throw new NotFoundError("No salary data found for this combination");

  return {
    ...range,
    minIdr: Math.round(range.minUsd * USD_TO_IDR),
    maxIdr: Math.round(range.maxUsd * USD_TO_IDR),
    usdToIdr: USD_TO_IDR,
  };
}

export async function listCategories() {
  const rows = await prisma.salaryRange.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return rows.map((r) => r.category);
}

export async function createSalaryRange(data) {
  return prisma.salaryRange.create({ data });
}

export async function updateSalaryRange(id, data) {
  return prisma.salaryRange.update({ where: { id }, data });
}
