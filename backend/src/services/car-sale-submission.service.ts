import { AppError } from "../errors/app-error.js";
import { findBranchById } from "../repositories/branch.repository.js";
import {
  createCustomerSubmission,
  deletePendingCustomerSubmission,
  findAdminSubmissions,
  findCustomerSubmissionById,
  findCustomerSubmissions,
  findSubmissionByIdForAdmin,
  updateCustomerSubmission,
  reviewPendingSubmission,
  type CarSaleSubmission,
} from "../repositories/car-sale-submission.repository.js";
import type {
  AdminCarSaleSubmissionsQuery,
  CreateCarSaleSubmissionInput,
  UpdateCarSaleSubmissionInput,
  ReviewCarSaleSubmissionInput,
} from "../validators/car-sale-submission.validator.js";

type SubmissionAdminScope = {
  adminRole?: "super_admin" | "branch_admin";
  branchId?: number | null;
};

export interface PaginatedAdminSubmissions {
  submissions: CarSaleSubmission[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const validateSubmissionBranch = async (
  branchId: number,
): Promise<void> => {
  const branch = await findBranchById(branchId);

  if (!branch || !branch.is_active) {
    throw new AppError({
      statusCode: 400,
      code: "INVALID_SUBMISSION_BRANCH",
      message:
        "The selected branch does not exist or is inactive.",
    });
  }
};

export const getMyCarSaleSubmissions = async (
  customerId: number,
): Promise<CarSaleSubmission[]> => {
  return findCustomerSubmissions(customerId);
};

export const getMyCarSaleSubmission = async (
  customerId: number,
  submissionId: number,
): Promise<CarSaleSubmission> => {
  const submission =
    await findCustomerSubmissionById(
      submissionId,
      customerId,
    );

  if (!submission) {
    throw new AppError({
      statusCode: 404,
      code: "CAR_SALE_SUBMISSION_NOT_FOUND",
      message: "Car-sale submission not found.",
    });
  }

  return submission;
};

export const createMyCarSaleSubmission = async (
  customerId: number,
  input: CreateCarSaleSubmissionInput,
): Promise<CarSaleSubmission> => {
  await validateSubmissionBranch(
    input.branch_id,
  );

  return createCustomerSubmission(
    customerId,
    input,
  );
};

export const updateMyCarSaleSubmission = async (
  customerId: number,
  submissionId: number,
  input: UpdateCarSaleSubmissionInput,
): Promise<CarSaleSubmission> => {
  const existing =
    await getMyCarSaleSubmission(
      customerId,
      submissionId,
    );

  if (existing.status !== "pending") {
    throw new AppError({
      statusCode: 409,
      code: "SUBMISSION_NOT_EDITABLE",
      message:
        "Only pending car-sale submissions may be edited.",
    });
  }

  if (input.branch_id !== undefined) {
    await validateSubmissionBranch(
      input.branch_id,
    );
  }

  await updateCustomerSubmission(
    submissionId,
    customerId,
    input,
  );

  return getMyCarSaleSubmission(
    customerId,
    submissionId,
  );
};

export const deleteMyCarSaleSubmission = async (
  customerId: number,
  submissionId: number,
): Promise<void> => {
  const existing =
    await getMyCarSaleSubmission(
      customerId,
      submissionId,
    );

  if (existing.status !== "pending") {
    throw new AppError({
      statusCode: 409,
      code: "SUBMISSION_NOT_DELETABLE",
      message:
        "Only pending car-sale submissions may be deleted.",
    });
  }

  const deleted =
    await deletePendingCustomerSubmission(
      submissionId,
      customerId,
    );

  if (!deleted) {
    throw new AppError({
      statusCode: 404,
      code: "CAR_SALE_SUBMISSION_NOT_FOUND",
      message: "Car-sale submission not found.",
    });
  }
};

export const getAdminCarSaleSubmissions = async (
  query: AdminCarSaleSubmissionsQuery,
  admin: SubmissionAdminScope,
): Promise<PaginatedAdminSubmissions> => {
  let branchId = query.branch_id;

  if (admin.adminRole === "branch_admin") {
    if (
      admin.branchId === undefined ||
      admin.branchId === null
    ) {
      throw new AppError({
        statusCode: 403,
        code: "ADMIN_BRANCH_REQUIRED",
        message:
          "This branch administrator is not assigned to a branch.",
      });
    }

    if (
      branchId !== undefined &&
      branchId !== admin.branchId
    ) {
      throw new AppError({
        statusCode: 403,
        code: "BRANCH_SCOPE_VIOLATION",
        message:
          "Branch administrators can review submissions only for their assigned branch.",
      });
    }

    branchId = admin.branchId;
  }

  const result =
    await findAdminSubmissions({
      ...(query.status !== undefined
        ? { status: query.status }
        : {}),

      ...(branchId !== undefined
        ? { branchId }
        : {}),

      page: query.page,
      limit: query.limit,
    });

  return {
    submissions: result.submissions,

    pagination: {
      page: query.page,
      limit: query.limit,
      total: result.total,
      totalPages:
        result.total === 0
          ? 0
          : Math.ceil(
              result.total /
                query.limit,
            ),
    },
  };
};

export const getAdminCarSaleSubmission = async (
  submissionId: number,
  admin: SubmissionAdminScope,
): Promise<CarSaleSubmission> => {
  const submission =
    await findSubmissionByIdForAdmin(
      submissionId,
    );

  if (!submission) {
    throw new AppError({
      statusCode: 404,
      code: "CAR_SALE_SUBMISSION_NOT_FOUND",
      message: "Car-sale submission not found.",
    });
  }

  if (
    admin.adminRole === "branch_admin" &&
    admin.branchId !==
      submission.branch_id
  ) {
    throw new AppError({
      statusCode: 403,
      code: "BRANCH_SCOPE_VIOLATION",
      message:
        "Branch administrators can review submissions only for their assigned branch.",
    });
  }

  return submission;
};

export const reviewCarSaleSubmission = async (
  submissionId: number,
  input: ReviewCarSaleSubmissionInput,
  admin: {
    id: number;
    adminRole?: "super_admin" | "branch_admin";
    branchId?: number | null;
  },
): Promise<CarSaleSubmission> => {
  const submission =
    await getAdminCarSaleSubmission(
      submissionId,
      admin,
    );

  if (submission.status !== "pending") {
    throw new AppError({
      statusCode: 409,
      code: "SUBMISSION_ALREADY_REVIEWED",
      message:
        "Only pending car-sale submissions may be reviewed.",
    });
  }

  const result = await reviewPendingSubmission(
    submissionId,
    admin.id,
    input.decision,
    input.admin_notes ?? null,
  );

  if (!result) {
    throw new AppError({
      statusCode: 404,
      code: "CAR_SALE_SUBMISSION_NOT_FOUND",
      message:
        "Car-sale submission not found.",
    });
  }

  if (
    result.submission.status === "pending"
  ) {
    throw new AppError({
      statusCode: 409,
      code: "SUBMISSION_REVIEW_FAILED",
      message:
        "The submission could not be reviewed.",
    });
  }

  return result.submission;
};