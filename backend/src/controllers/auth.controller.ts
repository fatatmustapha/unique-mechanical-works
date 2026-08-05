import type { NextFunction, Request, Response } from "express";

import {
  loginCustomer,
  registerCustomer,
} from "../services/auth.service.js";
import { sendSuccess } from "../utils/api-response.js";
import { setAuthCookies } from "../utils/cookies.js";
import {
  customerLoginSchema,
  customerRegistrationSchema,
} from "../validators/auth.validator.js";

export const register = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const input = customerRegistrationSchema.parse(request.body);
    const customer = await registerCustomer(input);

    sendSuccess(
      response,
      201,
      {
        customer,
      },
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
    const input = customerLoginSchema.parse(request.body);
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