import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  changeServiceStatus,
  createServiceForAdmin,
  getPublicServiceById,
  getPublicServices,
  updateServiceForAdmin,
} from "../services/service.service.js";
import { sendSuccess } from "../utils/api-response.js";

import {
  assignServiceToBranch,
  getBranchesForService,
  removeServiceFromBranch,
  updateServiceForBranch,
} from "../services/branch-service.service.js";

import {
  branchServiceParamsSchema,
  branchServiceServiceIdParamSchema,
  createBranchServiceSchema,
  updateBranchServiceSchema,
} from "../validators/branch-service.validator.js";
import {
  createServiceSchema,
  serviceIdParamSchema,
  updateServiceSchema,
  updateServiceStatusSchema,
} from "../validators/service.validator.js";

export const getServices = async (
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const services = await getPublicServices();

    sendSuccess(
      response,
      200,
      services,
      "Services retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const getService = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } =
      serviceIdParamSchema.parse(request.params);

    const service = await getPublicServiceById(id);

    sendSuccess(
      response,
      200,
      { service },
      "Service retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const createServiceController = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const input =
      createServiceSchema.parse(request.body);

    const service =
      await createServiceForAdmin(input);

    sendSuccess(
      response,
      201,
      { service },
      "Service created successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const updateServiceController = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } =
      serviceIdParamSchema.parse(request.params);

    const input =
      updateServiceSchema.parse(request.body);

    const service =
      await updateServiceForAdmin(id, input);

    sendSuccess(
      response,
      200,
      { service },
      "Service updated successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const patchServiceStatus = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } =
      serviceIdParamSchema.parse(request.params);

    const input =
      updateServiceStatusSchema.parse(request.body);

    const service =
      await changeServiceStatus(id, input);

    sendSuccess(
      response,
      200,
      { service },
      input.is_active
        ? "Service activated successfully."
        : "Service deactivated successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const getServiceBranches = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } =
      branchServiceServiceIdParamSchema.parse(
        request.params,
      );

    const branches = await getBranchesForService(id);

    sendSuccess(
      response,
      200,
      branches,
      "Service branches retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const createServiceBranch = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } =
      branchServiceServiceIdParamSchema.parse(
        request.params,
      );

    const input =
      createBranchServiceSchema.parse(
        request.body,
      );

    const branchService =
      await assignServiceToBranch(
        id,
        input,
      );

    sendSuccess(
      response,
      201,
      { branchService },
      "Service assigned to branch successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const updateServiceBranch = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id, branchId } =
      branchServiceParamsSchema.parse(
        request.params,
      );

    const input =
      updateBranchServiceSchema.parse(
        request.body,
      );

    const branchService =
      await updateServiceForBranch(
        id,
        branchId,
        input,
      );

    sendSuccess(
      response,
      200,
      { branchService },
      "Branch-specific service settings updated successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const deleteServiceBranch = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id, branchId } =
      branchServiceParamsSchema.parse(
        request.params,
      );

    await removeServiceFromBranch(
      id,
      branchId,
    );

    sendSuccess(
      response,
      200,
      {},
      "Service removed from branch successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};