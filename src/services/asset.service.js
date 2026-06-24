import prisma from "../lib/db.js";
import { NotFoundError } from "../errors/httpErrors.js";

export async function listAssets(category) {
  const where = { isActive: true };
  if (category) where.category = category;
  return prisma.asset.findMany({ where, orderBy: { createdAt: "desc" } });
}

export async function getAssetById(id) {
  const asset = await prisma.asset.findUnique({ where: { id } });
  if (!asset || !asset.isActive) throw new NotFoundError("Asset not found");
  return asset;
}

export async function createAsset(data) {
  return prisma.asset.create({ data });
}

export async function updateAsset(id, data) {
  const asset = await prisma.asset.findUnique({ where: { id } });
  if (!asset) throw new NotFoundError("Asset not found");
  return prisma.asset.update({ where: { id }, data });
}
