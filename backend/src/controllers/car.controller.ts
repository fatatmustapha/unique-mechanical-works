import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { AppError } from "../errors/app-error.js";
import {
  createCarForAdmin,
  getPublicCar,
  getPublicCars,
  updateCarForAdmin,
} from "../services/car.service.js";
import {
  sendPaginatedSuccess,
  sendSuccess,
} from "../utils/api-response.js";
import {
  carIdParamSchema,
  carSlugParamSchema,
  createCarSchema,
  publicCarsQuerySchema,
  updateCarSchema,
} from "../validators/car.validator.js";

export const getCars = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query =
      publicCarsQuerySchema.parse(request.query);

    const result = await getPublicCars(query);

    sendPaginatedSuccess(
      response,
      200,
      result.cars,
      result.pagination,
      "Cars retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const getCar = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { slug } =
      carSlugParamSchema.parse(request.params);

    const car = await getPublicCar(slug);

    sendSuccess(
      response,
      200,
      { car },
      "Car retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const createAdminCar = async (
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

    const input =
      createCarSchema.parse(request.body);

    const car = await createCarForAdmin(
      input,
      request.user,
    );

    sendSuccess(
      response,
      201,
      { car },
      "Car listing created successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const updateAdminCar = async (
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

    const { id } =
      carIdParamSchema.parse(request.params);

    const input =
      updateCarSchema.parse(request.body);

    const car = await updateCarForAdmin(
      id,
      input,
      request.user,
    );

    sendSuccess(
      response,
      200,
      { car },
      "Car listing updated successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};