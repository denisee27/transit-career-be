import { z } from "zod";
import { withAdmin } from "../../../../../src/middleware/withAdmin.js";
import { withValidation } from "../../../../../src/middleware/withValidation.js";
import { createJob, listJobs } from "../../../../../src/services/job.service.js";
import { created, paginated, errorResponse } from "../../../../../src/utils/response.js";

const createSchema = z.object({
  body: z.object({
    companyName: z.string().min(1),
    title: z.string().min(1),
    category: z.enum(["TECH", "DESIGN", "WRITING", "ADMIN", "FINANCE", "MARKETING", "OTHER"]),
    workType: z.enum(["REMOTE", "RELOCATION"]),
    country: z.string().min(1),
    applicationUrl: z.string().url(),
    companyLogo: z.string().optional(),
    timezone: z.string().optional(),
    salaryMin: z.number().positive().optional(),
    salaryMax: z.number().positive().optional(),
    salaryCurrency: z.string().optional(),
    isIndonesianFriendly: z.boolean().optional(),
  }),
});

const listSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({ page: z.string().optional(), limit: z.string().optional() }),
});

export const GET = withAdmin(
  withValidation(listSchema, async (request) => {
    try {
      const { page, limit } = request.parsed.query;
      const result = await listJobs({ page: Number(page ?? 1), limit: Number(limit ?? 20) });
      return paginated(result.jobs, result.meta);
    } catch (error) {
      return errorResponse(error);
    }
  })
);

export const POST = withAdmin(
  withValidation(createSchema, async (request) => {
    try {
      const job = await createJob(request.parsed.body);
      return created(job);
    } catch (error) {
      return errorResponse(error);
    }
  })
);
