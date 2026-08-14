import { AppError } from "../errors/app-error.js";
import {
  createBranch,
  findActiveBranchById,
  findActiveBranches,
  findAnotherBranchByName,
  findBranchById,
  updateBranch,
  updateBranchStatus,
  type Branch,
} from "../repositories/branch.repository.js";
import type {
  CreateBranchInput,
  UpdateBranchInput,
  UpdateBranchStatusInput,
} from "../validators/branch.validator.js";

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

export const createBranchForAdmin = async (
  input: CreateBranchInput,
): Promise<Branch> => {
  const duplicate = await findAnotherBranchByName(input.name);

  if (duplicate) {
    throw new AppError({
      statusCode: 409,
      code: "BRANCH_NAME_ALREADY_EXISTS",
      message: "A branch with this name already exists.",
    });
  }

  return createBranch(input);
};

export const updateBranchForAdmin = async (
  branchId: number,
  input: UpdateBranchInput,
): Promise<Branch> => {
  const existingBranch = await findBranchById(branchId);

  if (!existingBranch) {
    throw new AppError({
      statusCode: 404,
      code: "BRANCH_NOT_FOUND",
      message: "Branch not found.",
    });
  }

  if (input.name !== undefined) {
    const duplicate = await findAnotherBranchByName(
      input.name,
      branchId,
    );

    if (duplicate) {
      throw new AppError({
        statusCode: 409,
        code: "BRANCH_NAME_ALREADY_EXISTS",
        message: "A branch with this name already exists.",
      });
    }
  }

  await updateBranch(branchId, input);

  const updatedBranch = await findBranchById(branchId);

  if (!updatedBranch) {
    throw new Error("The updated branch could not be retrieved.");
  }

  return updatedBranch;
};

export const changeBranchStatus = async (
  branchId: number,
  input: UpdateBranchStatusInput,
): Promise<Branch> => {
  const existingBranch = await findBranchById(branchId);

  if (!existingBranch) {
    throw new AppError({
      statusCode: 404,
      code: "BRANCH_NOT_FOUND",
      message: "Branch not found.",
    });
  }

  await updateBranchStatus(branchId, input.is_active);

  const updatedBranch = await findBranchById(branchId);

  if (!updatedBranch) {
    throw new Error("The updated branch could not be retrieved.");
  }

  return updatedBranch;
};