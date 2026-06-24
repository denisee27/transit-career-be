import { handleWebhook } from "../../../../../src/services/payment.service.js";
import { success, errorResponse } from "../../../../../src/utils/response.js";

export async function POST(request) {
  try {
    const payload = await request.json();
    const result = await handleWebhook(payload);
    return success(result);
  } catch (error) {
    return errorResponse(error);
  }
}
