import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  getPublicServiceById,
  getPublicServices,
} from "../services/service.service.js";
import { sendSuccess } from "../utils/api-response.js";
import { serviceIdParamSchema } from "../validators/service.validator.js";

export const getServices = async (
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const services = await getPublicServices();

    sendSuccess(
      response,
      200,
      services,
      "Services retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const getService = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = serviceIdParamSchema.parse(
      request.params,
    );

    const service = await getPublicServiceById(id);

    sendSuccess(
      response,
      200,
      { service },
      "Service retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};