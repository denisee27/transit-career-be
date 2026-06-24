import { withAdmin } from "../../../../../src/middleware/withAdmin.js";
import { checkJobLinks } from "../../../../../src/services/job.service.js";
import { success, errorResponse } from "../../../../../src/utils/response.js";

export const POST = withAdmin(async () => {
  try {
    const results = await checkJobLinks();
    const broken = results.filter((r) => r.broken).length;
    return success({ checked: results.length, broken, results });
  } catch (error) {
    return errorResponse(error);
  }
});
