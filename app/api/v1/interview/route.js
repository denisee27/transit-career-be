import { z } from "zod";
import { withRateLimit } from "../../../../src/middleware/withRateLimit.js";
import { withValidation } from "../../../../src/middleware/withValidation.js";
import { listQuestions } from "../../../../src/services/interview.service.js";
import { verifyAccessToken } from "../../../../src/lib/auth.js";
import { success, errorResponse } from "../../../../src/utils/response.js";

const schema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    type: z.enum(["BEHAVIORAL", "REMOTE_ASYNC", "VISA_IMMIGRATION"]).optional(),
  }),
});

export const GET = withRateLimit(
  withValidation(schema, async (request) => {
    try {
      let userTier = "FREE";
      const header = request.headers.get("authorization");
      if (header?.startsWith("Bearer ")) {
        try {
          const payload = verifyAccessToken(header.slice(7));
          userTier = payload.tier;
        } catch {
          // unauthenticated — default to FREE
        }
      }

      const questions = await listQuestions(request.parsed.query.type, userTier);
      return success(questions);
    } catch (error) {
      return errorResponse(error);
    }
  })
);
