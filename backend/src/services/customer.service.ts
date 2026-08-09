import { AppError } from "../errors/app-error.js";
import {
  findActiveBranchById,
  type PublicCustomer,
} from "../repositories/auth.repository.js";
import {
  findAnotherCustomerByEmail,
  getCustomerById,
  listCustomers,
  updateCustomerProfile,
  updateCustomerStatus,
} from "../repositories/customer.repository.js";
import type {
  CustomerListQuery,
  UpdateCustomerProfileInput,
  UpdateCustomerStatusInput,
} from "../validators/customer.validator.js";

export interface PaginatedCustomersResult {
  customers: PublicCustomer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getMyCustomerProfile = async (
  customerId: number,
): Promise<PublicCustomer> => {
  const customer = await getCustomerById(customerId);

  if (!customer) {
    throw new AppError({
      statusCode: 404,
      code: "CUSTOMER_NOT_FOUND",
      message: "Customer profile not found.",
    });
  }

  if (!customer.is_active) {
    throw new AppError({
      statusCode: 403,
      code: "ACCOUNT_INACTIVE",
      message: "This customer account is inactive.",
    });
  }

  return customer;
};

export const updateMyCustomerProfile = async (
  customerId: number,
  input: UpdateCustomerProfileInput,
): Promise<PublicCustomer> => {
  const existingCustomer =
    await getCustomerById(customerId);

  if (!existingCustomer) {
    throw new AppError({
      statusCode: 404,
      code: "CUSTOMER_NOT_FOUND",
      message: "Customer profile not found.",
    });
  }

  if (!existingCustomer.is_active) {
    throw new AppError({
      statusCode: 403,
      code: "ACCOUNT_INACTIVE",
      message: "This customer account is inactive.",
    });
  }

  if (input.email !== undefined) {
    const duplicateEmail =
      await findAnotherCustomerByEmail(
        input.email,
        customerId,
      );

    if (duplicateEmail) {
      throw new AppError({
        statusCode: 409,
        code: "EMAIL_ALREADY_REGISTERED",
        message:
          "Another account already uses this email address.",
      });
    }
  }

  if (
    input.preferred_branch_id !== undefined &&
    input.preferred_branch_id !== null
  ) {
    const branch = await findActiveBranchById(
      input.preferred_branch_id,
    );

    if (!branch) {
      throw new AppError({
        statusCode: 400,
        code: "INVALID_PREFERRED_BRANCH",
        message:
          "The selected preferred branch does not exist or is inactive.",
      });
    }
  }

  await updateCustomerProfile(
    customerId,
    input,
  );

  const updatedCustomer =
    await getCustomerById(customerId);

  if (!updatedCustomer) {
    throw new Error(
      "The updated customer could not be retrieved.",
    );
  }

  return updatedCustomer;
};

export const getCustomersForAdmin = async (
  query: CustomerListQuery,
): Promise<PaginatedCustomersResult> => {
  const result = await listCustomers(query);

  return {
    customers: result.customers,
    pagination: {
      page: query.page,
      limit: query.limit,
      total: result.total,
      totalPages:
        result.total === 0
          ? 0
          : Math.ceil(result.total / query.limit),
    },
  };
};

export const getCustomerForAdmin = async (
  customerId: number,
): Promise<PublicCustomer> => {
  const customer = await getCustomerById(customerId);

  if (!customer) {
    throw new AppError({
      statusCode: 404,
      code: "CUSTOMER_NOT_FOUND",
      message: "Customer not found.",
    });
  }

  return customer;
};

export const changeCustomerStatus = async (
  customerId: number,
  input: UpdateCustomerStatusInput,
): Promise<PublicCustomer> => {
  const existingCustomer =
    await getCustomerById(customerId);

  if (!existingCustomer) {
    throw new AppError({
      statusCode: 404,
      code: "CUSTOMER_NOT_FOUND",
      message: "Customer not found.",
    });
  }

  await updateCustomerStatus(
    customerId,
    input.is_active,
  );

  const updatedCustomer =
    await getCustomerById(customerId);

  if (!updatedCustomer) {
    throw new Error(
      "The updated customer could not be retrieved.",
    );
  }

  return updatedCustomer;
};