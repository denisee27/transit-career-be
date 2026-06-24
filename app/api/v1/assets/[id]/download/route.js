import { z } from "zod";
import { withAuth } from "../../../../../../src/middleware/withAuth.js";
import { withValidation } from "../../../../../../src/middleware/withValidation.js";
import { getAssetById } from "../../../../../../src/services/asset.service.js";
import { success, errorResponse } from "../../../../../../src/utils/response.js";
import { ForbiddenError } from "../../../../../../src/errors/httpErrors.js";

const schema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const GET = withAuth(
  withValidation(schema, async (request) => {
    try {
      if (request.user.tier === "FREE") {
        throw new ForbiddenError("Premium access required to download assets");
      }

      const asset = await getAssetById(request.parsed.params.id);
      return success({ url: asset.fileUrl ?? asset.notionUrl, format: asset.format });
    } catch (error) {
      return errorResponse(error);
    }
  })
);
