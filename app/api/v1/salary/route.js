import { z } from "zod";
import { withRateLimit } from "../../../../src/middleware/withRateLimit.js";
import { withValidation } from "../../../../src/middleware/withValidation.js";
import { getSalaryRange, listCategories } from "../../../../src/services/salary.service.js";
import { success, errorResponse } from "../../../../src/utils/response.js";

const schema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    category: z.string().optional(),
    level: z.enum(["JUNIOR", "MID", "SENIOR"]).optional(),
    region: z.enum(["US", "EU", "APAC", "GLOBAL_REMOTE"]).optional(),
  }),
});

export const GET = withRateLimit(
  withValidation(schema, async (request) => {
    try {
      const { category, level, region } = request.parsed.query;

      if (!category && !level && !region) {
        const categories = await listCategories();
        return success({ categories });
      }

      const range = await getSalaryRange({ category, level, region });
      return success(range);
    } catch (error) {
      return errorResponse(error);
    }
  })
);
