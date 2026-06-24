import { z } from "zod";
import { withRateLimit } from "../../../../src/middleware/withRateLimit.js";
import { withValidation } from "../../../../src/middleware/withValidation.js";
import { listJobs } from "../../../../src/services/job.service.js";
import { paginated, errorResponse } from "../../../../src/utils/response.js";

const schema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    category: z
      .enum(["TECH", "DESIGN", "WRITING", "ADMIN", "FINANCE", "MARKETING", "OTHER"])
      .optional(),
    workType: z.enum(["REMOTE", "RELOCATION"]).optional(),
    timezone: z.string().optional(),
    indonesianFriendly: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const GET = withRateLimit(
  withValidation(schema, async (request) => {
    try {
      const { category, workType, timezone, indonesianFriendly, page, limit } =
        request.parsed.query;

      const result = await listJobs({
        category,
        workType,
        timezone,
        indonesianFriendly,
        page: Number(page ?? 1),
        limit: Math.min(Number(limit ?? 20), 50),
      });

      return paginated(result.jobs, result.meta);
    } catch (error) {
      return errorResponse(error);
    }
  })
);
