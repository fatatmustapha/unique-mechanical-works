import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/app-error.js";
import {
  createMyCarSaleSubmission,
  deleteMyCarSaleSubmission,
  getMyCarSaleSubmission,
  getMyCarSaleSubmissions,
  updateMyCarSaleSubmission,
  getAdminCarSaleSubmission,
  getAdminCarSaleSubmissions,
  reviewCarSaleSubmission,
} from "../services/car-sale-submission.service.js";
import { sendSuccess } from "../utils/api-response.js";
import {
  carSaleSubmissionIdParamSchema,
  createCarSaleSubmissionSchema,
  updateCarSaleSubmissionSchema,
  adminCarSaleSubmissionsQuerySchema,
  reviewCarSaleSubmissionSchema,
} from "../validators/car-sale-submission.validator.js";

const getCustomerId = (request: Request): number => {
  if (!request.user || request.user.accountType !== "customer") {
    throw new AppError({
      statusCode: 401,
      code: "AUTHENTICATION_REQUIRED",
      message: "Customer authentication is required.",
    });
  }

  return request.user.id;
};

export const createSubmission = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customerId = getCustomerId(request);

    const input = createCarSaleSubmissionSchema.parse(request.body);

    const submission = await createMyCarSaleSubmission(customerId, input);

    sendSuccess(
      response,
      201,
      { submission },
      "Car-sale submission created successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const getMySubmissions = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customerId = getCustomerId(request);

    const submissions = await getMyCarSaleSubmissions(customerId);

    sendSuccess(
      response,
      200,
      submissions,
      "Car-sale submissions retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const getMySubmission = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customerId = getCustomerId(request);

    const { id } = carSaleSubmissionIdParamSchema.parse(request.params);

    const submission = await getMyCarSaleSubmission(customerId, id);

    sendSuccess(
      response,
      200,
      { submission },
      "Car-sale submission retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const updateMySubmission = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customerId = getCustomerId(request);

    const { id } = carSaleSubmissionIdParamSchema.parse(request.params);

    const input = updateCarSaleSubmissionSchema.parse(request.body);

    const submission = await updateMyCarSaleSubmission(customerId, id, input);

    sendSuccess(
      response,
      200,
      { submission },
      "Car-sale submission updated successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const deleteMySubmission = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customerId = getCustomerId(request);

    const { id } = carSaleSubmissionIdParamSchema.parse(request.params);

    await deleteMyCarSaleSubmission(customerId, id);

    sendSuccess(response, 200, {}, "Car-sale submission deleted successfully.");
  } catch (error: unknown) {
    next(error);
  }
};

const getAdminUser = (
  request: Request,
) => {
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

  return request.user;
};

export const getAdminSubmissions = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const admin = getAdminUser(request);

    const query =
      adminCarSaleSubmissionsQuerySchema.parse(
        request.query,
      );

    const result =
      await getAdminCarSaleSubmissions(
        query,
        admin,
      );

    sendSuccess(
      response,
      200,
      result,
      "Car-sale submissions retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const getAdminSubmission = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const admin = getAdminUser(request);

    const { id } =
      carSaleSubmissionIdParamSchema.parse(
        request.params,
      );

    const submission =
      await getAdminCarSaleSubmission(
        id,
        admin,
      );

    sendSuccess(
      response,
      200,
      { submission },
      "Car-sale submission retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const reviewAdminSubmission = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const admin = getAdminUser(request);

    const { id } =
      carSaleSubmissionIdParamSchema.parse(
        request.params,
      );

    const input =
      reviewCarSaleSubmissionSchema.parse(
        request.body,
      );

    const submission =
      await reviewCarSaleSubmission(
        id,
        input,
        admin,
      );

    sendSuccess(
      response,
      200,
      { submission },
      input.decision === "approved"
        ? "Car-sale submission approved successfully."
        : "Car-sale submission rejected successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};