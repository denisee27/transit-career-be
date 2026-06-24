import prisma from "../lib/db.js";
import { NotFoundError } from "../errors/httpErrors.js";

export async function getRoadmap(pathType, userId) {
  const path = await prisma.roadmapPath.findUnique({
    where: { type: pathType },
    include: {
      phases: {
        orderBy: { order: "asc" },
        include: {
          notes: true,
          tasks: {
            orderBy: { order: "asc" },
            include: userId
              ? { progress: { where: { userId } } }
              : { progress: false },
          },
        },
      },
    },
  });

  if (!path) throw new NotFoundError("Roadmap path not found");
  return path;
}

export async function toggleTaskProgress(userId, taskId) {
  const existing = await prisma.userProgress.findUnique({
    where: { userId_taskId: { userId, taskId } },
  });

  if (existing) {
    return prisma.userProgress.update({
      where: { userId_taskId: { userId, taskId } },
      data: {
        completed: !existing.completed,
        completedAt: !existing.completed ? new Date() : null,
      },
    });
  }

  return prisma.userProgress.create({
    data: { userId, taskId, completed: true, completedAt: new Date() },
  });
}
