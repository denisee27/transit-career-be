import { z } from "zod";
import { withRateLimit } from "../../../../src/middleware/withRateLimit.js";
import { withValidation } from "../../../../src/middleware/withValidation.js";
import { listAssets } from "../../../../src/services/asset.service.js";
import { success, errorResponse } from "../../../../src/utils/response.js";

const schema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    category: z
      .enum(["ATS_CV_TEMPLATE", "REMOTE_JOB_TOOLKIT", "GLOBAL_VISA_KIT"])
      .optional(),
  }),
});

export const GET = withRateLimit(
  withValidation(schema, async (request) => {
    try {
      const assets = await listAssets(request.parsed.query.category);
      return success(assets);
    } catch (error) {
      return errorResponse(error);
    }
  })
);
