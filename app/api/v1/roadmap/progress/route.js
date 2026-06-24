import { z } from "zod";
import { withAuth } from "../../../../../src/middleware/withAuth.js";
import { withValidation } from "../../../../../src/middleware/withValidation.js";
import { toggleTaskProgress } from "../../../../../src/services/roadmap.service.js";
import { success, errorResponse } from "../../../../../src/utils/response.js";

const schema = z.object({
  body: z.object({ taskId: z.string().uuid("Invalid task ID") }),
});

export const POST = withAuth(
  withValidation(schema, async (request) => {
    try {
      const result = await toggleTaskProgress(request.user.id, request.parsed.body.taskId);
      return success(result);
    } catch (error) {
      return errorResponse(error);
    }
  })
);
