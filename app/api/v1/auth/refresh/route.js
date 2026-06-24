import { z } from "zod";
import { withValidation } from "../../../../../src/middleware/withValidation.js";
import { refreshTokens } from "../../../../../src/services/auth.service.js";
import { success, errorResponse } from "../../../../../src/utils/response.js";

const schema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
    deviceInfo: z.string().optional(),
  }),
});

export const POST = withValidation(schema, async (request) => {
  try {
    const { refreshToken, deviceInfo } = request.parsed.body;
    const info = deviceInfo ?? request.headers.get("user-agent") ?? "unknown";
    const result = await refreshTokens(refreshToken, info);
    return success(result);
  } catch (error) {
    return errorResponse(error);
  }
});
