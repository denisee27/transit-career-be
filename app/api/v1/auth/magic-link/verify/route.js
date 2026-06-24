import { z } from "zod";
import { withRateLimit } from "../../../../../../src/middleware/withRateLimit.js";
import { withValidation } from "../../../../../../src/middleware/withValidation.js";
import { verifyMagicLink } from "../../../../../../src/services/auth.service.js";
import { success, errorResponse } from "../../../../../../src/utils/response.js";

const schema = z.object({
  body: z.object({
    token: z.string().min(1, "Token is required"),
    deviceInfo: z.string().optional(),
  }),
});

export const POST = withRateLimit(
  withValidation(schema, async (request) => {
    try {
      const { token, deviceInfo } = request.parsed.body;
      const info = deviceInfo ?? request.headers.get("user-agent") ?? "unknown";
      const result = await verifyMagicLink(token, info);
      return success(result);
    } catch (error) {
      return errorResponse(error);
    }
  })
);
