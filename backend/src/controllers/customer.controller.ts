import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { AppError } from "../errors/app-error.js";
import {
  changeCustomerStatus,
  getCustomerForAdmin,
  getCustomersForAdmin,
  getMyCustomerProfile,
  updateMyCustomerProfile,
} from "../services/customer.service.js";
import {
  sendPaginatedSuccess,
  sendSuccess,
} from "../utils/api-response.js";
import {
  customerIdParamSchema,
  customerListQuerySchema,
  updateCustomerProfileSchema,
  updateCustomerStatusSchema,
} from "../validators/customer.validator.js";

const getAuthenticatedCustomerId = (
  request: Request,
): number => {
  if (
    !request.user ||
    request.user.accountType !== "customer"
  ) {
    throw new AppError({
      statusCode: 401,
      code: "AUTHENTICATION_REQUIRED",
      message: "Customer authentication is required.",
    });
  }

  return request.user.id;
};

export const getMyProfile = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customerId =
      getAuthenticatedCustomerId(request);

    const customer =
      await getMyCustomerProfile(customerId);

    sendSuccess(
      response,
      200,
      { customer },
      "Customer profile retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const updateMyProfile = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customerId =
      getAuthenticatedCustomerId(request);

    const input =
      updateCustomerProfileSchema.parse(
        request.body,
      );

    const customer =
      await updateMyCustomerProfile(
        customerId,
        input,
      );

    sendSuccess(
      response,
      200,
      { customer },
      "Customer profile updated successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const getCustomers = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query =
      customerListQuerySchema.parse(
        request.query,
      );

    const result =
      await getCustomersForAdmin(query);

    sendPaginatedSuccess(
      response,
      200,
      result.customers,
      result.pagination,
      "Customers retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const getCustomer = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } =
      customerIdParamSchema.parse(
        request.params,
      );

    const customer =
      await getCustomerForAdmin(id);

    sendSuccess(
      response,
      200,
      { customer },
      "Customer retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const patchCustomerStatus = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } =
      customerIdParamSchema.parse(
        request.params,
      );

    const input =
      updateCustomerStatusSchema.parse(
        request.body,
      );

    const customer =
      await changeCustomerStatus(
        id,
        input,
      );

    sendSuccess(
      response,
      200,
      { customer },
      input.is_active
        ? "Customer activated successfully."
        : "Customer deactivated successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};