import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { AppError } from "../errors/app-error.js";
import { getAdminDashboardSummary } from "../services/dashboard.service.js";
import { sendSuccess } from "../utils/api-response.js";

export const getDashboardSummary = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (
      !request.user ||
      request.user.accountType !== "admin"
    ) {
      throw new AppError({
        statusCode: 401,
        code: "AUTHENTICATION_REQUIRED",
        message:
          "Administrator authentication is required.",
      });
    }

    const summary =
      await getAdminDashboardSummary();

    sendSuccess(
      response,
      200,
      { summary },
      "Dashboard summary retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};