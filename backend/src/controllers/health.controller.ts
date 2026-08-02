import type { NextFunction, Request, Response } from "express";

import { testDatabaseConnection } from "../config/database.js";
import { env } from "../config/env.js";
import { sendSuccess } from "../utils/api-response.js";

export const getApplicationHealth = (
  _request: Request,
  response: Response,
): void => {
  sendSuccess(
    response,
    200,
    {
      status: "healthy",
      environment: env.NODE_ENV,
    },
    "Unique Mechanical Works API is running.",
  );
};

export const getDatabaseHealth = async (
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const database = await testDatabaseConnection();

    sendSuccess(
      response,
      200,
      {
        status: "healthy",
        database,
      },
      "Database connection is healthy.",
    );
  } catch (error: unknown) {
    next(error);
  }
};