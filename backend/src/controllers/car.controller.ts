import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { AppError } from "../errors/app-error.js";
import {
  archiveCar,
  createCarForAdmin,
  deleteCar,
  getPublicCar,
  getPublicCars,
  markCarAvailable,
  markCarSold,
  publishCar,
  toggleFeaturedCar,
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

const ensureAdminUser = (request: Request) => {
  if (
    !request.user ||
    request.user.accountType !== "admin"
  ) {
    throw new AppError({
      statusCode: 401,
      code: "AUTHENTICATION_REQUIRED",
      message: "Administrator authentication is required.",
    });
  }

  return request.user;
};

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
    const admin = ensureAdminUser(request);

    const input =
      createCarSchema.parse(request.body);

    const car = await createCarForAdmin(
      input,
      admin,
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
    const admin = ensureAdminUser(request);

    const { id } =
      carIdParamSchema.parse(request.params);

    const input =
      updateCarSchema.parse(request.body);

    const car = await updateCarForAdmin(
      id,
      input,
      admin,
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

export const publishCarController = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const admin = ensureAdminUser(request);

    const { id } =
      carIdParamSchema.parse(request.params);

    const car = await publishCar(id, admin);

    sendSuccess(
      response,
      200,
      { car },
      "Car published successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const archiveCarController = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const admin = ensureAdminUser(request);

    const { id } =
      carIdParamSchema.parse(request.params);

    const car = await archiveCar(id, admin);

    sendSuccess(
      response,
      200,
      { car },
      "Car archived successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const toggleFeaturedCarController = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const admin = ensureAdminUser(request);

    const { id } =
      carIdParamSchema.parse(request.params);

    const car = await toggleFeaturedCar(
      id,
      admin,
    );

    sendSuccess(
      response,
      200,
      { car },
      "Car featured status updated successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const markCarSoldController = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const admin = ensureAdminUser(request);

    const { id } =
      carIdParamSchema.parse(request.params);

    const car = await markCarSold(
      id,
      admin,
    );

    sendSuccess(
      response,
      200,
      { car },
      "Car marked as sold successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const markCarAvailableController = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const admin = ensureAdminUser(request);

    const { id } =
      carIdParamSchema.parse(request.params);

    const car = await markCarAvailable(
      id,
      admin,
    );

    sendSuccess(
      response,
      200,
      { car },
      "Car marked as available successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const deleteCarController = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const admin = ensureAdminUser(request);

    const { id } =
      carIdParamSchema.parse(request.params);

    await deleteCar(id, admin);

    sendSuccess(
      response,
      200,
      {},
      "Car deleted successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};