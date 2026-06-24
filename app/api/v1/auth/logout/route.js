import { z } from "zod";
import { withAuth } from "../../../../../src/middleware/withAuth.js";
import { withValidation } from "../../../../../src/middleware/withValidation.js";
import { logout } from "../../../../../src/services/auth.service.js";
import { success, errorResponse } from "../../../../../src/utils/response.js";

const schema = z.object({
  body: z.object({ refreshToken: z.string().optional() }),
});

export const POST = withAuth(
  withValidation(schema, async (request) => {
    try {
      const result = await logout(request.user.id, request.parsed.body.refreshToken);
      return success(result);
    } catch (error) {
      return errorResponse(error);
    }
  })
);
