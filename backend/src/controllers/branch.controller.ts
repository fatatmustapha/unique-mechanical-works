import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  changeBranchStatus,
  createBranchForAdmin,
  getPublicBranchById,
  getPublicBranches,
  updateBranchForAdmin,
} from "../services/branch.service.js";
import { sendSuccess } from "../utils/api-response.js";
import {
  branchIdParamSchema,
  createBranchSchema,
  updateBranchSchema,
  updateBranchStatusSchema,
} from "../validators/branch.validator.js";

export const getBranches = async (
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const branches = await getPublicBranches();

    sendSuccess(
      response,
      200,
      branches,
      "Branches retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const getBranch = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = branchIdParamSchema.parse(request.params);
    const branch = await getPublicBranchById(id);

    sendSuccess(
      response,
      200,
      { branch },
      "Branch retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const createBranchController = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const input = createBranchSchema.parse(request.body);
    const branch = await createBranchForAdmin(input);

    sendSuccess(
      response,
      201,
      { branch },
      "Branch created successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const updateBranchController = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = branchIdParamSchema.parse(request.params);
    const input = updateBranchSchema.parse(request.body);

    const branch = await updateBranchForAdmin(id, input);

    sendSuccess(
      response,
      200,
      { branch },
      "Branch updated successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const patchBranchStatus = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = branchIdParamSchema.parse(request.params);
    const input = updateBranchStatusSchema.parse(request.body);

    const branch = await changeBranchStatus(id, input);

    sendSuccess(
      response,
      200,
      { branch },
      input.is_active
        ? "Branch activated successfully."
        : "Branch deactivated successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};