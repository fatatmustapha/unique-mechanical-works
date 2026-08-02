import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/app-error.js";

export const notFoundMiddleware = (
  request: Request,
  _response: Response,
  next: NextFunction,
): void => {
  next(
    new AppError({
      statusCode: 404,
      code: "ROUTE_NOT_FOUND",
      message: `The requested route ${request.method} ${request.originalUrl} was not found.`,
    }),
  );
};