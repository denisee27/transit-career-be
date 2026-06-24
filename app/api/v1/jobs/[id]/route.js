import { z } from "zod";
import { withAuth } from "../../../../../src/middleware/withAuth.js";
import { withValidation } from "../../../../../src/middleware/withValidation.js";
import { getJobById } from "../../../../../src/services/job.service.js";
import { success, errorResponse } from "../../../../../src/utils/response.js";

const schema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const GET = withAuth(
  withValidation(schema, async (request) => {
    try {
      const job = await getJobById(request.parsed.params.id);
      return success(job);
    } catch (error) {
      return errorResponse(error);
    }
  })
);
