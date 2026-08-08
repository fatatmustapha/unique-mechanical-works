import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../config/jwt.js";
import { AppError } from "../errors/app-error.js";
import {
  createCustomer,
  findActiveBranchById,
  findAdminById,
  findAdminForLogin,
  findCustomerByEmail,
  findCustomerById,
  findCustomerForLogin,
  updateAdminLastLogin,
  updateCustomerLastLogin,
  type PublicAdmin,
  type PublicCustomer,
} from "../repositories/auth.repository.js";
import {
  createRefreshSession,
  revokeRefreshSession,
  rotateRefreshSession,
} from "../repositories/refresh-session.repository.js";
import type {
  AccountType,
  TokenPair,
} from "../types/auth.js";
import {
  comparePassword,
  hashPassword,
} from "../utils/password.js";
import {
  getTokenExpiration,
  hashToken,
} from "../utils/token.js";
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

export type CurrentUserResult =
  | {
      accountType: "customer";
      customer: PublicCustomer;
    }
  | {
      accountType: "admin";
      admin: PublicAdmin;
    };

const createTokenPair = (
  accountType: AccountType,
  accountId: number,
  admin?: PublicAdmin,
): TokenPair => {
  if (accountType === "customer") {
    return {
      accessToken: generateAccessToken({
        id: accountId,
        accountType: "customer",
      }),

      refreshToken: generateRefreshToken({
        id: accountId,
        accountType: "customer",
      }),
    };
  }

  if (!admin) {
    throw new Error(
      "Admin information is required when generating admin tokens.",
    );
  }

  return {
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
};

const saveRefreshSession = async (
  accountType: AccountType,
  accountId: number,
  refreshToken: string,
): Promise<void> => {
  await createRefreshSession({
    accountType,
    accountId,
    tokenHash: hashToken(refreshToken),
    expiresAt: getTokenExpiration(refreshToken),
  });
};

export const registerCustomer = async (
  input: CustomerRegistrationInput,
): Promise<PublicCustomer> => {
  const existingCustomer =
    await findCustomerByEmail(input.email);

  if (existingCustomer) {
    throw new AppError({
      statusCode: 409,
      code: "EMAIL_ALREADY_REGISTERED",
      message:
        "An account with this email address already exists.",
    });
  }

  if (input.preferred_branch_id !== undefined) {
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

  const passwordHash = await hashPassword(
    input.password,
  );

  return createCustomer({
    ...input,
    password_hash: passwordHash,
  });
};

export const loginCustomer = async (
  input: CustomerLoginInput,
): Promise<CustomerLoginResult> => {
  const customer = await findCustomerForLogin(
    input.email,
  );

  if (!customer) {
    throw new AppError({
      statusCode: 401,
      code: "INVALID_CREDENTIALS",
      message:
        "The email address or password is incorrect.",
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
      message:
        "The email address or password is incorrect.",
    });
  }

  if (!customer.is_active) {
    throw new AppError({
      statusCode: 403,
      code: "ACCOUNT_INACTIVE",
      message: "This customer account is inactive.",
    });
  }

  const tokens = createTokenPair(
    "customer",
    customer.customer_id,
  );

  await saveRefreshSession(
    "customer",
    customer.customer_id,
    tokens.refreshToken,
  );

  await updateCustomerLastLogin(
    customer.customer_id,
  );

  const {
    password_hash: _passwordHash,
    ...publicCustomer
  } = customer;

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
      message:
        "The email address or password is incorrect.",
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
      message:
        "The email address or password is incorrect.",
    });
  }

  if (!admin.is_active) {
    throw new AppError({
      statusCode: 403,
      code: "ACCOUNT_INACTIVE",
      message: "This admin account is inactive.",
    });
  }

  if (
    admin.role === "branch_admin" &&
    admin.branch_id === null
  ) {
    throw new AppError({
      statusCode: 403,
      code: "ADMIN_BRANCH_NOT_ASSIGNED",
      message:
        "This branch admin is not assigned to a branch.",
    });
  }

  const tokens = createTokenPair(
    "admin",
    admin.admin_id,
    admin,
  );

  await saveRefreshSession(
    "admin",
    admin.admin_id,
    tokens.refreshToken,
  );

  await updateAdminLastLogin(admin.admin_id);

  const {
    password_hash: _passwordHash,
    ...publicAdmin
  } = admin;

  return {
    admin: publicAdmin,
    tokens,
  };
};

export const getCurrentUser = async (
  authenticatedUser: {
    id: number;
    accountType: AccountType;
  },
): Promise<CurrentUserResult> => {
  if (
    authenticatedUser.accountType === "customer"
  ) {
    const customer = await findCustomerById(
      authenticatedUser.id,
    );

    if (!customer) {
      throw new AppError({
        statusCode: 401,
        code: "ACCOUNT_NOT_FOUND",
        message:
          "The authenticated customer account no longer exists.",
      });
    }

    if (!customer.is_active) {
      throw new AppError({
        statusCode: 403,
        code: "ACCOUNT_INACTIVE",
        message:
          "This customer account is inactive.",
      });
    }

    return {
      accountType: "customer",
      customer,
    };
  }

  const admin = await findAdminById(
    authenticatedUser.id,
  );

  if (!admin) {
    throw new AppError({
      statusCode: 401,
      code: "ACCOUNT_NOT_FOUND",
      message:
        "The authenticated admin account no longer exists.",
    });
  }

  if (!admin.is_active) {
    throw new AppError({
      statusCode: 403,
      code: "ACCOUNT_INACTIVE",
      message: "This admin account is inactive.",
    });
  }

  return {
    accountType: "admin",
    admin,
  };
};

export const refreshAuthentication = async (
  refreshToken: string,
): Promise<TokenPair> => {
  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError({
      statusCode: 401,
      code: "INVALID_REFRESH_TOKEN",
      message:
        "The refresh token is invalid or expired.",
    });
  }

  if (payload.accountType === "customer") {
    const customer = await findCustomerById(
      payload.id,
    );

    if (!customer || !customer.is_active) {
      throw new AppError({
        statusCode: 401,
        code: "REFRESH_SESSION_INVALID",
        message:
          "The refresh session is no longer valid.",
      });
    }

    const tokens = createTokenPair(
      "customer",
      customer.customer_id,
    );

    const rotated = await rotateRefreshSession(
      hashToken(refreshToken),
      {
        accountType: "customer",
        accountId: customer.customer_id,
        tokenHash: hashToken(
          tokens.refreshToken,
        ),
        expiresAt: getTokenExpiration(
          tokens.refreshToken,
        ),
      },
    );

    if (!rotated) {
      throw new AppError({
        statusCode: 401,
        code: "REFRESH_SESSION_INVALID",
        message:
          "The refresh session is invalid, expired, or has already been used.",
      });
    }

    return tokens;
  }

  const admin = await findAdminById(payload.id);

  if (!admin || !admin.is_active) {
    throw new AppError({
      statusCode: 401,
      code: "REFRESH_SESSION_INVALID",
      message:
        "The refresh session is no longer valid.",
    });
  }

  if (
    admin.role === "branch_admin" &&
    admin.branch_id === null
  ) {
    throw new AppError({
      statusCode: 403,
      code: "ADMIN_BRANCH_NOT_ASSIGNED",
      message:
        "This branch admin is not assigned to a branch.",
    });
  }

  const tokens = createTokenPair(
    "admin",
    admin.admin_id,
    admin,
  );

  const rotated = await rotateRefreshSession(
    hashToken(refreshToken),
    {
      accountType: "admin",
      accountId: admin.admin_id,
      tokenHash: hashToken(tokens.refreshToken),
      expiresAt: getTokenExpiration(
        tokens.refreshToken,
      ),
    },
  );

  if (!rotated) {
    throw new AppError({
      statusCode: 401,
      code: "REFRESH_SESSION_INVALID",
      message:
        "The refresh session is invalid, expired, or has already been used.",
    });
  }

  return tokens;
};

export const logoutSession = async (
  refreshToken: string | undefined,
): Promise<void> => {
  if (!refreshToken) {
    return;
  }

  await revokeRefreshSession(
    hashToken(refreshToken),
  );
};