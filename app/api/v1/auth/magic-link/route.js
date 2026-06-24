import { z } from "zod";
import { withRateLimit } from "../../../../../src/middleware/withRateLimit.js";
import { withValidation } from "../../../../../src/middleware/withValidation.js";
import { sendMagicLink } from "../../../../../src/services/auth.service.js";
import { success, errorResponse } from "../../../../../src/utils/response.js";

const schema = z.object({
  body: z.object({ email: z.string().email("Please enter a valid email address") }),
});

export const POST = withRateLimit(
  withValidation(schema, async (request) => {
    try {
      const { email } = request.parsed.body;
      const result = await sendMagicLink(email);
      return success(result);
    } catch (error) {
      return errorResponse(error);
    }
  }),
  { limit: 5, windowMs: 60000 }
);
