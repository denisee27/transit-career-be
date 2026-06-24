import { withAuth } from "../../../../../src/middleware/withAuth.js";
import { getMe } from "../../../../../src/services/user.service.js";
import { success, errorResponse } from "../../../../../src/utils/response.js";

export const GET = withAuth(async (request) => {
  try {
    const user = await getMe(request.user.id);
    return success(user);
  } catch (error) {
    return errorResponse(error);
  }
});
