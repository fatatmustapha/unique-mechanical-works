import type { NextFunction, Request, Response } from "express";

import { registerCustomer } from "../services/auth.service.js";
import { sendSuccess } from "../utils/api-response.js";
import { customerRegistrationSchema } from "../validators/auth.validator.js";

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