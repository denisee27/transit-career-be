import { withAuth } from "./withAuth.js";
import { ForbiddenError } from "../errors/httpErrors.js";
import { errorResponse } from "../utils/response.js";

export function withAdmin(handler) {
  return withAuth(async function (request, context) {
    try {
      if (request.user.tier !== "ADMIN") throw new ForbiddenError("Admin access required");
      return await handler(request, context);
    } catch (error) {
      return errorResponse(error);
    }
  });
}
