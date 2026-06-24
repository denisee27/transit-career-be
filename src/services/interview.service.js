import prisma from "../lib/db.js";
import { NotFoundError } from "../errors/httpErrors.js";

export async function listQuestions(type, userTier) {
  const where = {};
  if (type) where.type = type;
  if (userTier === "FREE") where.isFree = true;

  return prisma.interviewQuestion.findMany({
    where,
    orderBy: [{ type: "asc" }, { order: "asc" }],
  });
}

export async function createQuestion(data) {
  return prisma.interviewQuestion.create({ data });
}

export async function updateQuestion(id, data) {
  const q = await prisma.interviewQuestion.findUnique({ where: { id } });
  if (!q) throw new NotFoundError("Question not found");
  return prisma.interviewQuestion.update({ where: { id }, data });
}

export async function deleteQuestion(id) {
  const q = await prisma.interviewQuestion.findUnique({ where: { id } });
  if (!q) throw new NotFoundError("Question not found");
  return prisma.interviewQuestion.delete({ where: { id } });
}
