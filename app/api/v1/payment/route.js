import { z } from "zod";
import { withAuth } from "../../../../src/middleware/withAuth.js";
import { withValidation } from "../../../../src/middleware/withValidation.js";
import { createPayment, getPaymentStatus } from "../../../../src/services/payment.service.js";
import { success, created, errorResponse } from "../../../../src/utils/response.js";

const getSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({ paymentId: z.string().uuid().optional() }),
});

export const GET = withAuth(
  withValidation(getSchema, async (request) => {
    try {
      const { paymentId } = request.parsed.query;
      if (!paymentId) return success(null);
      const payment = await getPaymentStatus(paymentId, request.user.id);
      return success(payment);
    } catch (error) {
      return errorResponse(error);
    }
  })
);

export const POST = withAuth(async (request) => {
  try {
    const result = await createPayment(request.user.id);
    return created(result);
  } catch (error) {
    return errorResponse(error);
  }
});
