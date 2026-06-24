import { z } from "zod";
import { withRateLimit } from "../../../../../src/middleware/withRateLimit.js";
import { withValidation } from "../../../../../src/middleware/withValidation.js";
import { loginWithPassword } from "../../../../../src/services/auth.service.js";
import { success, errorResponse } from "../../../../../src/utils/response.js";

const schema = z.object({
  body: z.object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(1, "Password is required"),
    deviceInfo: z.string().optional(),
  }),
});

export const POST = withRateLimit(
  withValidation(schema, async (request) => {
    try {
      const { email, password, deviceInfo } = request.parsed.body;
      const info = deviceInfo ?? request.headers.get("user-agent") ?? "unknown";
      const result = await loginWithPassword(email, password, info);
      return success(result);
    } catch (error) {
      return errorResponse(error);
    }
  }),
  { limit: 10, windowMs: 60000 }
);
