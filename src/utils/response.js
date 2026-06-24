import { NextResponse } from "next/server";
import { AppError } from "../errors/httpErrors.js";
import { ZodError } from "zod";

export function success(data, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function created(data) {
  return success(data, 201);
}

export function paginated(data, meta) {
  return NextResponse.json({ success: true, data, meta });
}

export function errorResponse(error) {
  const isDev = process.env.NODE_ENV !== "production";

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed",
        details: error.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
      },
      { status: 422 }
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
  }

  return NextResponse.json(
    { success: false, error: isDev ? error.message : "Internal server error" },
    { status: 500 }
  );
}
