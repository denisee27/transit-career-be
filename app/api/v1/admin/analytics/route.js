import { withAdmin } from "../../../../../src/middleware/withAdmin.js";
import { getAnalytics } from "../../../../../src/services/admin.service.js";
import { success, errorResponse } from "../../../../../src/utils/response.js";

export const GET = withAdmin(async (request) => {
  try {
    const analytics = await getAnalytics();
    return success(analytics);
  } catch (error) {
    return errorResponse(error);
  }
});
