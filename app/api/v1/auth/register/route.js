import { z } from "zod";
import { withRateLimit } from "../../../../../src/middleware/withRateLimit.js";
import { withValidation } from "../../../../../src/middleware/withValidation.js";
import { register } from "../../../../../src/services/auth.service.js";
import { created, errorResponse } from "../../../../../src/utils/response.js";

const schema = z.object({
  body: z.object({
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
  }),
});

export const POST = withRateLimit(
  withValidation(schema, async (request) => {
    try {
      const { email, password, name } = request.parsed.body;
      const deviceInfo = request.headers.get("user-agent") ?? "unknown";
      const result = await register(email, password, name, deviceInfo);
      return created(result);
    } catch (error) {
      return errorResponse(error);
    }
  }),
  { limit: 10, windowMs: 60000 }
);
