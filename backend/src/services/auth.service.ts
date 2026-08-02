import { AppError } from "../errors/app-error.js";
import {
  createCustomer,
  findActiveBranchById,
  findCustomerByEmail,
  type PublicCustomer,
} from "../repositories/auth.repository.js";
import { hashPassword } from "../utils/password.js";
import type { CustomerRegistrationInput } from "../validators/auth.validator.js";

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