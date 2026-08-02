import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { env } from "../config/env.js";
import { AppError } from "../errors/app-error.js";
import type { ApiErrorResponse } from "../types/api-response.js";

interface DatabaseError extends Error {
  code?: string;
  errno?: number;
  sqlState?: string;
}

const isDatabaseError = (error: unknown): error is DatabaseError => {
  return error instanceof Error && "code" in error;
};

const sendErrorResponse = (
  response: Response,
  statusCode: number,
  code: string,
  message: string,
  details: unknown[] = [],
): Response<ApiErrorResponse> => {
  return response.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
};

export const errorMiddleware = (
  error: unknown,
  _request: Request,
  response: Response,
  next: NextFunction,
): Response<ApiErrorResponse> | void => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof AppError) {
    return sendErrorResponse(
      response,
      error.statusCode,
      error.code,
      error.message,
      error.details,
    );
  }

  if (error instanceof ZodError) {
    const details = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    }));

    return sendErrorResponse(
      response,
      400,
      "VALIDATION_ERROR",
      "The supplied data is invalid.",
      details,
    );
  }

  if (isDatabaseError(error)) {
    if (error.code === "ER_DUP_ENTRY") {
      return sendErrorResponse(
        response,
        409,
        "DUPLICATE_RESOURCE",
        "A record with the supplied information already exists.",
      );
    }

    if (
      error.code === "ER_NO_REFERENCED_ROW_2" ||
      error.code === "ER_ROW_IS_REFERENCED_2"
    ) {
      return sendErrorResponse(
        response,
        409,
        "DATABASE_RELATION_CONFLICT",
        "The requested operation conflicts with related records.",
      );
    }
  }

  console.error("Unhandled application error:", error);

  const message =
    env.NODE_ENV === "development" && error instanceof Error
      ? error.message
      : "An unexpected server error occurred.";

  return sendErrorResponse(
    response,
    500,
    "INTERNAL_SERVER_ERROR",
    message,
  );
};