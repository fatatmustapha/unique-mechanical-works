import { AppError } from "../errors/app-error.js";
import {
  findActiveBranchById,
  findActiveBranches,
  type Branch,
} from "../repositories/branch.repository.js";

export const getPublicBranches = async (): Promise<Branch[]> => {
  return findActiveBranches();
};

export const getPublicBranchById = async (
  branchId: number,
): Promise<Branch> => {
  const branch = await findActiveBranchById(branchId);

  if (!branch) {
    throw new AppError({
      statusCode: 404,
      code: "BRANCH_NOT_FOUND",
      message: "Branch not found.",
    });
  }

  return branch;
};