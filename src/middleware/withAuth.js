import { extractBearerToken, verifyAccessToken } from "../lib/auth.js";
import { errorResponse } from "../utils/response.js";
import { UnauthorizedError } from "../errors/httpErrors.js";
import prisma from "../lib/db.js";

export function withAuth(handler) {
  return async function (request, context) {
    try {
      const token = extractBearerToken(request);
      if (!token) throw new UnauthorizedError("No token provided");

      const payload = verifyAccessToken(token);
      const user = await prisma.user.findUnique({ where: { id: payload.userId } });
      if (!user) throw new UnauthorizedError("User not found");

      request.user = user;
      return await handler(request, context);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
