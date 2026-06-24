import { ZodError } from "zod";
import { errorResponse } from "../utils/response.js";

export function withValidation(schema, handler) {
  return async function (request, context) {
    try {
      let body = {};
      const contentType = request.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        body = await request.json().catch(() => ({}));
      }

      const url = new URL(request.url);
      const query = Object.fromEntries(url.searchParams.entries());
      const params = context?.params ? await context.params : {};

      const parsed = schema.parse({ body, query, params });
      request.parsed = parsed;
      return await handler(request, context);
    } catch (error) {
      if (error instanceof ZodError) return errorResponse(error);
      return errorResponse(error);
    }
  };
}
