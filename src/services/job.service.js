import prisma from "../lib/db.js";
import { NotFoundError } from "../errors/httpErrors.js";

export async function listJobs({ category, workType, timezone, indonesianFriendly, page = 1, limit = 20 }) {
  const where = { isActive: true };
  if (category) where.category = category;
  if (workType) where.workType = workType;
  if (indonesianFriendly === "true") where.isIndonesianFriendly = true;
  if (timezone) where.timezone = { contains: timezone, mode: "insensitive" };

  const skip = (page - 1) * limit;

  const [jobs, total] = await prisma.$transaction([
    prisma.job.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.job.count({ where }),
  ]);

  return { jobs, meta: { total, page, totalPages: Math.ceil(total / limit) } };
}

export async function getJobById(id) {
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job || !job.isActive) throw new NotFoundError("Job not found");
  return job;
}

export async function createJob(data) {
  return prisma.job.create({ data });
}

export async function updateJob(id, data) {
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) throw new NotFoundError("Job not found");
  return prisma.job.update({ where: { id }, data });
}

export async function deleteJob(id) {
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) throw new NotFoundError("Job not found");
  return prisma.job.update({ where: { id }, data: { isActive: false } });
}

export async function checkJobLinks() {
  const jobs = await prisma.job.findMany({
    where: { isActive: true },
    select: { id: true, applicationUrl: true },
  });

  const results = await Promise.all(
    jobs.map(async (job) => {
      try {
        const res = await fetch(job.applicationUrl, {
          method: "HEAD",
          signal: AbortSignal.timeout(5000),
        });
        return { id: job.id, broken: res.status === 404 || res.status >= 500 };
      } catch {
        return { id: job.id, broken: true };
      }
    })
  );

  await Promise.all(
    results.map(({ id, broken }) =>
      prisma.job.update({ where: { id }, data: { linkBroken: broken } })
    )
  );

  return results;
}
