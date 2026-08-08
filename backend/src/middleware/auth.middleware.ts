import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { verifyAccessToken } from "../config/jwt.js";
import { AppError } from "../errors/app-error.js";
import type { AuthenticatedUser } from "../types/auth.js";

export const authenticate = (
  request: Request,
  _response: Response,
  next: NextFunction,
): void => {
  try {
    const accessToken = request.cookies[
      env.ACCESS_TOKEN_COOKIE_NAME
    ] as string | undefined;

    if (!accessToken) {
      throw new AppError({
        statusCode: 401,
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication is required.",
      });
    }

    const payload = verifyAccessToken(accessToken);

    const authenticatedUser: AuthenticatedUser = {
      id: payload.id,
      accountType: payload.accountType,
    };

    if (payload.adminRole !== undefined) {
      authenticatedUser.adminRole = payload.adminRole;
    }

    if (payload.branchId !== undefined) {
      authenticatedUser.branchId = payload.branchId;
    }

    request.user = authenticatedUser;

    next();
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      next(
        new AppError({
          statusCode: 401,
          code: "ACCESS_TOKEN_EXPIRED",
          message: "Your session access token has expired.",
        }),
      );

      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      next(
        new AppError({
          statusCode: 401,
          code: "INVALID_ACCESS_TOKEN",
          message: "The authentication token is invalid.",
        }),
      );

      return;
    }

    next(error);
  }
};

export const requireCustomer = (
  request: Request,
  _response: Response,
  next: NextFunction,
): void => {
  if (!request.user) {
    next(
      new AppError({
        statusCode: 401,
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication is required.",
      }),
    );

    return;
  }

  if (request.user.accountType !== "customer") {
    next(
      new AppError({
        statusCode: 403,
        code: "CUSTOMER_ACCESS_REQUIRED",
        message: "This endpoint is available to customers only.",
      }),
    );

    return;
  }

  next();
};

export const requireAdmin = (
  request: Request,
  _response: Response,
  next: NextFunction,
): void => {
  if (!request.user) {
    next(
      new AppError({
        statusCode: 401,
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication is required.",
      }),
    );

    return;
  }

  if (request.user.accountType !== "admin") {
    next(
      new AppError({
        statusCode: 403,
        code: "ADMIN_ACCESS_REQUIRED",
        message: "Administrator access is required.",
      }),
    );

    return;
  }

  next();
};

export const requireSuperAdmin = (
  request: Request,
  _response: Response,
  next: NextFunction,
): void => {
  if (!request.user) {
    next(
      new AppError({
        statusCode: 401,
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication is required.",
      }),
    );

    return;
  }

  if (
    request.user.accountType !== "admin" ||
    request.user.adminRole !== "super_admin"
  ) {
    next(
      new AppError({
        statusCode: 403,
        code: "SUPER_ADMIN_ACCESS_REQUIRED",
        message: "Super administrator access is required.",
      }),
    );

    return;
  }

  next();
};