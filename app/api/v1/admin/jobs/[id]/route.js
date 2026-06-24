import { z } from "zod";
import { withAdmin } from "../../../../../../src/middleware/withAdmin.js";
import { withValidation } from "../../../../../../src/middleware/withValidation.js";
import { updateJob, deleteJob } from "../../../../../../src/services/job.service.js";
import { success, errorResponse } from "../../../../../../src/utils/response.js";

const schema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z
    .object({
      companyName: z.string().min(1).optional(),
      title: z.string().min(1).optional(),
      category: z
        .enum(["TECH", "DESIGN", "WRITING", "ADMIN", "FINANCE", "MARKETING", "OTHER"])
        .optional(),
      workType: z.enum(["REMOTE", "RELOCATION"]).optional(),
      country: z.string().optional(),
      applicationUrl: z.string().url().optional(),
      isActive: z.boolean().optional(),
      isIndonesianFriendly: z.boolean().optional(),
    })
    .optional(),
  query: z.object({}).optional(),
});

export const PATCH = withAdmin(
  withValidation(schema, async (request) => {
    try {
      const job = await updateJob(request.parsed.params.id, request.parsed.body ?? {});
      return success(job);
    } catch (error) {
      return errorResponse(error);
    }
  })
);

export const DELETE = withAdmin(
  withValidation(schema, async (request) => {
    try {
      await deleteJob(request.parsed.params.id);
      return success({ message: "Job archived successfully" });
    } catch (error) {
      return errorResponse(error);
    }
  })
);
