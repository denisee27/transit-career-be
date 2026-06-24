import { z } from "zod";
import { withRateLimit } from "../../../../../src/middleware/withRateLimit.js";
import { withValidation } from "../../../../../src/middleware/withValidation.js";
import { getRoadmap } from "../../../../../src/services/roadmap.service.js";
import { verifyAccessToken } from "../../../../../src/lib/auth.js";
import { success, errorResponse } from "../../../../../src/utils/response.js";

const schema = z.object({
  params: z.object({
    pathType: z.enum(["WHV_AUSTRALIA", "AUSBILDUNG_GERMANY"]),
  }),
  body: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const GET = withRateLimit(
  withValidation(schema, async (request) => {
    try {
      let userId = null;
      const header = request.headers.get("authorization");
      if (header?.startsWith("Bearer ")) {
        try {
          const payload = verifyAccessToken(header.slice(7));
          userId = payload.userId;
        } catch {
          // unauthenticated visitor — proceed without userId
        }
      }

      const roadmap = await getRoadmap(request.parsed.params.pathType, userId);
      return success(roadmap);
    } catch (error) {
      return errorResponse(error);
    }
  })
);
