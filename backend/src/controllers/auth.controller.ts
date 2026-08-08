import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { env } from "../config/env.js";
import { AppError } from "../errors/app-error.js";
import {
  getCurrentUser,
  loginAdmin,
  loginCustomer,
  logoutSession,
  refreshAuthentication,
  registerCustomer,
} from "../services/auth.service.js";
import { sendSuccess } from "../utils/api-response.js";
import {
  clearAuthCookies,
  setAuthCookies,
} from "../utils/cookies.js";
import {
  adminLoginSchema,
  customerLoginSchema,
  customerRegistrationSchema,
} from "../validators/auth.validator.js";

export const register = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const input =
      customerRegistrationSchema.parse(
        request.body,
      );

    const customer = await registerCustomer(
      input,
    );

    sendSuccess(
      response,
      201,
      { customer },
      "Customer account created successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const login = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const input = customerLoginSchema.parse(
      request.body,
    );

    const result = await loginCustomer(input);

    setAuthCookies(
      response,
      result.tokens.accessToken,
      result.tokens.refreshToken,
    );

    sendSuccess(
      response,
      200,
      {
        customer: result.customer,
      },
      "Customer logged in successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const adminLogin = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const input = adminLoginSchema.parse(
      request.body,
    );

    const result = await loginAdmin(input);

    setAuthCookies(
      response,
      result.tokens.accessToken,
      result.tokens.refreshToken,
    );

    sendSuccess(
      response,
      200,
      {
        admin: result.admin,
      },
      "Admin logged in successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const me = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!request.user) {
      throw new AppError({
        statusCode: 401,
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication is required.",
      });
    }

    const currentUser =
      await getCurrentUser({
        id: request.user.id,
        accountType:
          request.user.accountType,
      });

    sendSuccess(
      response,
      200,
      currentUser,
      "Current authenticated user retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const refresh = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const refreshToken = request.cookies[
      env.REFRESH_TOKEN_COOKIE_NAME
    ] as string | undefined;

    if (!refreshToken) {
      throw new AppError({
        statusCode: 401,
        code: "REFRESH_TOKEN_REQUIRED",
        message:
          "A refresh token is required.",
      });
    }

    const tokens =
      await refreshAuthentication(
        refreshToken,
      );

    setAuthCookies(
      response,
      tokens.accessToken,
      tokens.refreshToken,
    );

    sendSuccess(
      response,
      200,
      {},
      "Authentication session refreshed successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const logout = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const refreshToken = request.cookies[
      env.REFRESH_TOKEN_COOKIE_NAME
    ] as string | undefined;

    await logoutSession(refreshToken);

    clearAuthCookies(response);

    sendSuccess(
      response,
      200,
      {},
      "Logged out successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};