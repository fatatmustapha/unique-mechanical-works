import {
  generateAccessToken,
  generateRefreshToken,
} from "../config/jwt.js";
import { AppError } from "../errors/app-error.js";
import {
  createCustomer,
  findActiveBranchById,
  findAdminForLogin,
  findCustomerByEmail,
  findCustomerForLogin,
  updateAdminLastLogin,
  updateCustomerLastLogin,
  type PublicAdmin,
  type PublicCustomer,
} from "../repositories/auth.repository.js";
import type { TokenPair } from "../types/auth.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import type {
  AdminLoginInput,
  CustomerLoginInput,
  CustomerRegistrationInput,
} from "../validators/auth.validator.js";

export interface CustomerLoginResult {
  customer: PublicCustomer;
  tokens: TokenPair;
}

export interface AdminLoginResult {
  admin: PublicAdmin;
  tokens: TokenPair;
}

export const registerCustomer = async (
  input: CustomerRegistrationInput,
): Promise<PublicCustomer> => {
  const existingCustomer = await findCustomerByEmail(input.email);

  if (existingCustomer) {
    throw new AppError({
      statusCode: 409,
      code: "EMAIL_ALREADY_REGISTERED",
      message: "An account with this email address already exists.",
    });
  }

  if (input.preferred_branch_id !== undefined) {
    const branch = await findActiveBranchById(input.preferred_branch_id);

    if (!branch) {
      throw new AppError({
        statusCode: 400,
        code: "INVALID_PREFERRED_BRANCH",
        message: "The selected preferred branch does not exist or is inactive.",
      });
    }
  }

  const passwordHash = await hashPassword(input.password);

  return createCustomer({
    ...input,
    password_hash: passwordHash,
  });
};

export const loginCustomer = async (
  input: CustomerLoginInput,
): Promise<CustomerLoginResult> => {
  const customer = await findCustomerForLogin(input.email);

  if (!customer) {
    throw new AppError({
      statusCode: 401,
      code: "INVALID_CREDENTIALS",
      message: "The email address or password is incorrect.",
    });
  }

  const passwordMatches = await comparePassword(
    input.password,
    customer.password_hash,
  );

  if (!passwordMatches) {
    throw new AppError({
      statusCode: 401,
      code: "INVALID_CREDENTIALS",
      message: "The email address or password is incorrect.",
    });
  }

  if (!customer.is_active) {
    throw new AppError({
      statusCode: 403,
      code: "ACCOUNT_INACTIVE",
      message: "This customer account is inactive.",
    });
  }

  const tokens: TokenPair = {
    accessToken: generateAccessToken({
      id: customer.customer_id,
      accountType: "customer",
    }),

    refreshToken: generateRefreshToken({
      id: customer.customer_id,
      accountType: "customer",
    }),
  };

  await updateCustomerLastLogin(customer.customer_id);

  const { password_hash: _passwordHash, ...publicCustomer } = customer;

  return {
    customer: publicCustomer,
    tokens,
  };
};

export const loginAdmin = async (
  input: AdminLoginInput,
): Promise<AdminLoginResult> => {
  const admin = await findAdminForLogin(input.email);

  if (!admin) {
    throw new AppError({
      statusCode: 401,
      code: "INVALID_CREDENTIALS",
      message: "The email address or password is incorrect.",
    });
  }

  const passwordMatches = await comparePassword(
    input.password,
    admin.password_hash,
  );

  if (!passwordMatches) {
    throw new AppError({
      statusCode: 401,
      code: "INVALID_CREDENTIALS",
      message: "The email address or password is incorrect.",
    });
  }

  if (!admin.is_active) {
    throw new AppError({
      statusCode: 403,
      code: "ACCOUNT_INACTIVE",
      message: "This admin account is inactive.",
    });
  }

  if (admin.role === "branch_admin" && admin.branch_id === null) {
    throw new AppError({
      statusCode: 403,
      code: "ADMIN_BRANCH_NOT_ASSIGNED",
      message: "This branch admin is not assigned to a branch.",
    });
  }

  const tokens: TokenPair = {
    accessToken: generateAccessToken({
      id: admin.admin_id,
      accountType: "admin",
      adminRole: admin.role,
      branchId: admin.branch_id,
    }),

    refreshToken: generateRefreshToken({
      id: admin.admin_id,
      accountType: "admin",
      adminRole: admin.role,
      branchId: admin.branch_id,
    }),
  };

  await updateAdminLastLogin(admin.admin_id);

  const { password_hash: _passwordHash, ...publicAdmin } = admin;

  return {
    admin: publicAdmin,
    tokens,
  };
};