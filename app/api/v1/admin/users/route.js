import { z } from "zod";
import { withAdmin } from "../../../../../src/middleware/withAdmin.js";
import { withValidation } from "../../../../../src/middleware/withValidation.js";
import { listUsers } from "../../../../../src/services/admin.service.js";
import { paginated, errorResponse } from "../../../../../src/utils/response.js";

const schema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const GET = withAdmin(
  withValidation(schema, async (request) => {
    try {
      const { page, limit } = request.parsed.query;
      const result = await listUsers({
        page: Number(page ?? 1),
        limit: Number(limit ?? 20),
      });
      return paginated(result.users, result.meta);
    } catch (error) {
      return errorResponse(error);
    }
  })
);
