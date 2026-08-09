import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  getPublicBranchById,
  getPublicBranches,
} from "../services/branch.service.js";
import { sendSuccess } from "../utils/api-response.js";
import { branchIdParamSchema } from "../validators/branch.validator.js";

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