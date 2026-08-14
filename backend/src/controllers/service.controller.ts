import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  changeServiceStatus,
  createServiceForAdmin,
  getPublicServiceById,
  getPublicServices,
  updateServiceForAdmin,
} from "../services/service.service.js";
import { sendSuccess } from "../utils/api-response.js";
import {
  createServiceSchema,
  serviceIdParamSchema,
  updateServiceSchema,
  updateServiceStatusSchema,
} from "../validators/service.validator.js";

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
    const { id } =
      serviceIdParamSchema.parse(request.params);

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

export const createServiceController = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const input =
      createServiceSchema.parse(request.body);

    const service =
      await createServiceForAdmin(input);

    sendSuccess(
      response,
      201,
      { service },
      "Service created successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const updateServiceController = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } =
      serviceIdParamSchema.parse(request.params);

    const input =
      updateServiceSchema.parse(request.body);

    const service =
      await updateServiceForAdmin(id, input);

    sendSuccess(
      response,
      200,
      { service },
      "Service updated successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const patchServiceStatus = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } =
      serviceIdParamSchema.parse(request.params);

    const input =
      updateServiceStatusSchema.parse(request.body);

    const service =
      await changeServiceStatus(id, input);

    sendSuccess(
      response,
      200,
      { service },
      input.is_active
        ? "Service activated successfully."
        : "Service deactivated successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};