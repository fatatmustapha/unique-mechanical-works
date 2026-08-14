import { AppError } from "../errors/app-error.js";
import { findBranchById } from "../repositories/branch.repository.js";
import {
  createBranchService,
  deleteBranchService,
  findBranchService,
  findBranchServiceIdentity,
  findBranchServicesByServiceId,
  updateBranchService,
  type BranchService,
} from "../repositories/branch-service.repository.js";
import { findServiceById } from "../repositories/service.repository.js";
import type {
  CreateBranchServiceInput,
  UpdateBranchServiceInput,
} from "../validators/branch-service.validator.js";

const ensureServiceExists = async (
  serviceId: number,
): Promise<void> => {
  const service = await findServiceById(serviceId);

  if (!service) {
    throw new AppError({
      statusCode: 404,
      code: "SERVICE_NOT_FOUND",
      message: "Service not found.",
    });
  }
};

const ensureBranchExists = async (
  branchId: number,
): Promise<void> => {
  const branch = await findBranchById(branchId);

  if (!branch) {
    throw new AppError({
      statusCode: 404,
      code: "BRANCH_NOT_FOUND",
      message: "Branch not found.",
    });
  }
};

export const getBranchesForService = async (
  serviceId: number,
): Promise<BranchService[]> => {
  await ensureServiceExists(serviceId);

  return findBranchServicesByServiceId(serviceId);
};

export const assignServiceToBranch = async (
  serviceId: number,
  input: CreateBranchServiceInput,
): Promise<BranchService> => {
  await ensureServiceExists(serviceId);
  await ensureBranchExists(input.branch_id);

  const existing = await findBranchServiceIdentity(
    serviceId,
    input.branch_id,
  );

  if (existing) {
    throw new AppError({
      statusCode: 409,
      code: "SERVICE_ALREADY_ASSIGNED_TO_BRANCH",
      message:
        "This service is already assigned to the selected branch.",
    });
  }

  return createBranchService(serviceId, input);
};

export const updateServiceForBranch = async (
  serviceId: number,
  branchId: number,
  input: UpdateBranchServiceInput,
): Promise<BranchService> => {
  await ensureServiceExists(serviceId);
  await ensureBranchExists(branchId);

  const existing = await findBranchService(
    serviceId,
    branchId,
  );

  if (!existing) {
    throw new AppError({
      statusCode: 404,
      code: "BRANCH_SERVICE_NOT_FOUND",
      message:
        "This service is not assigned to the selected branch.",
    });
  }

  await updateBranchService(
    serviceId,
    branchId,
    input,
  );

  const updated = await findBranchService(
    serviceId,
    branchId,
  );

  if (!updated) {
    throw new Error(
      "The updated branch-service record could not be retrieved.",
    );
  }

  return updated;
};

export const removeServiceFromBranch = async (
  serviceId: number,
  branchId: number,
): Promise<void> => {
  await ensureServiceExists(serviceId);

  const deleted = await deleteBranchService(
    serviceId,
    branchId,
  );

  if (!deleted) {
    throw new AppError({
      statusCode: 404,
      code: "BRANCH_SERVICE_NOT_FOUND",
      message:
        "This service is not assigned to the selected branch.",
    });
  }
};