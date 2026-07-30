import {
  type NextFunction,
  type Request,
  type Response,
} from "express";

import { testDatabaseConnection } from "../config/database.js";
import { env } from "../config/env.js";

export const getApplicationHealth = (
  _request: Request,
  response: Response,
): void => {
  response.status(200).json({
    success: true,
    message: "Unique Mechanical Works API is running.",
    data: {
      status: "healthy",
      environment: env.NODE_ENV,
    },
  });
};

export const getDatabaseHealth = async (
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const database = await testDatabaseConnection();

    response.status(200).json({
      success: true,
      message: "Database connection is healthy.",
      data: {
        status: "healthy",
        database,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
};