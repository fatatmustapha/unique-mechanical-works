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
  getAdminCar,
  getAdminCars,
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
  adminCarsQuerySchema,
  carIdParamSchema,
  carSlugParamSchema,
  createCarSchema,
  publicCarsQuerySchema,
  updateCarSchema,
} from "../validators/car.validator.js";

/*
|--------------------------------------------------------------------------
| ADMIN AUTH HELPER
|--------------------------------------------------------------------------
*/

const ensureAdminUser = (
  request: Request,
) => {
  if (
    !request.user ||
    request.user.accountType !==
      "admin"
  ) {
    throw new AppError({
      statusCode: 401,

      code:
        "AUTHENTICATION_REQUIRED",

      message:
        "Administrator authentication is required.",
    });
  }

  return request.user;
};

/*
|--------------------------------------------------------------------------
| PUBLIC CAR LIST
|--------------------------------------------------------------------------
*/

export const getCars =
  async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query =
        publicCarsQuerySchema.parse(
          request.query,
        );

      const result =
        await getPublicCars(
          query,
        );

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

/*
|--------------------------------------------------------------------------
| PUBLIC CAR DETAILS
|--------------------------------------------------------------------------
*/

export const getCar =
  async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { slug } =
        carSlugParamSchema.parse(
          request.params,
        );

      const car =
        await getPublicCar(
          slug,
        );

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

/*
|--------------------------------------------------------------------------
| ADMIN CAR LIST
|--------------------------------------------------------------------------
|
| GET /api/admin/cars
|
*/

export const getAdminCarsController =
  async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const admin =
        ensureAdminUser(
          request,
        );

      const query =
        adminCarsQuerySchema.parse(
          request.query,
        );

      const result =
        await getAdminCars(
          query,
          admin,
        );

      sendPaginatedSuccess(
        response,
        200,
        result.cars,
        result.pagination,
        "Admin vehicles retrieved successfully.",
      );
    } catch (error: unknown) {
      next(error);
    }
  };

/*
|--------------------------------------------------------------------------
| ADMIN CAR DETAILS
|--------------------------------------------------------------------------
|
| GET /api/admin/cars/:id
|
*/

export const getAdminCarController =
  async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const admin =
        ensureAdminUser(
          request,
        );

      const { id } =
        carIdParamSchema.parse(
          request.params,
        );

      const car =
        await getAdminCar(
          id,
          admin,
        );

      sendSuccess(
        response,
        200,
        { car },
        "Admin vehicle retrieved successfully.",
      );
    } catch (error: unknown) {
      next(error);
    }
  };

/*
|--------------------------------------------------------------------------
| ADMIN CREATE CAR
|--------------------------------------------------------------------------
|
| POST /api/admin/cars
|
*/

export const createAdminCar =
  async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const admin =
        ensureAdminUser(
          request,
        );

      const input =
        createCarSchema.parse(
          request.body,
        );

      const car =
        await createCarForAdmin(
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

/*
|--------------------------------------------------------------------------
| ADMIN UPDATE CAR
|--------------------------------------------------------------------------
|
| PUT /api/admin/cars/:id
|
*/

export const updateAdminCar =
  async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const admin =
        ensureAdminUser(
          request,
        );

      const { id } =
        carIdParamSchema.parse(
          request.params,
        );

      const input =
        updateCarSchema.parse(
          request.body,
        );

      const car =
        await updateCarForAdmin(
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

/*
|--------------------------------------------------------------------------
| ADMIN SALE STATUS
|--------------------------------------------------------------------------
|
| PATCH /api/admin/cars/:id/status
|
| Body:
|
| {
|   "status": "sold"
| }
|
| OR
|
| {
|   "status": "available"
| }
|
*/

export const updateCarStatusController =
  async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const admin =
        ensureAdminUser(
          request,
        );

      const { id } =
        carIdParamSchema.parse(
          request.params,
        );

      const { status } =
        request.body as {
          status?: string;
        };

      if (
        status !== "sold" &&
        status !== "available"
      ) {
        throw new AppError({
          statusCode: 400,

          code:
            "INVALID_CAR_STATUS",

          message:
            "Status must be either 'sold' or 'available'.",
        });
      }

      const car =
        status === "sold"
          ? await markCarSold(
              id,
              admin,
            )
          : await markCarAvailable(
              id,
              admin,
            );

      sendSuccess(
        response,
        200,
        { car },
        `Car marked as ${status} successfully.`,
      );
    } catch (error: unknown) {
      next(error);
    }
  };

/*
|--------------------------------------------------------------------------
| ADMIN PUBLICATION STATUS
|--------------------------------------------------------------------------
|
| PATCH /api/admin/cars/:id/publication
|
| Body:
|
| {
|   "status": "published"
| }
|
| OR
|
| {
|   "status": "archived"
| }
|
*/

export const updateCarPublicationController =
  async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const admin =
        ensureAdminUser(
          request,
        );

      const { id } =
        carIdParamSchema.parse(
          request.params,
        );

      const { status } =
        request.body as {
          status?: string;
        };

      if (
        status !== "published" &&
        status !== "archived"
      ) {
        throw new AppError({
          statusCode: 400,

          code:
            "INVALID_PUBLICATION_STATUS",

          message:
            "Publication status must be either 'published' or 'archived'.",
        });
      }

      const car =
        status === "published"
          ? await publishCar(
              id,
              admin,
            )
          : await archiveCar(
              id,
              admin,
            );

      sendSuccess(
        response,
        200,
        { car },
        `Car ${status} successfully.`,
      );
    } catch (error: unknown) {
      next(error);
    }
  };

/*
|--------------------------------------------------------------------------
| ADMIN FEATURED STATUS
|--------------------------------------------------------------------------
|
| PATCH /api/admin/cars/:id/featured
|
*/

export const updateCarFeaturedController =
  async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const admin =
        ensureAdminUser(
          request,
        );

      const { id } =
        carIdParamSchema.parse(
          request.params,
        );

      const car =
        await toggleFeaturedCar(
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

/*
|--------------------------------------------------------------------------
| ADMIN DELETE CAR
|--------------------------------------------------------------------------
|
| DELETE /api/admin/cars/:id
|
*/

export const deleteCarController =
  async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const admin =
        ensureAdminUser(
          request,
        );

      const { id } =
        carIdParamSchema.parse(
          request.params,
        );

      await deleteCar(
        id,
        admin,
      );

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