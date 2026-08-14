import { AppError } from "../errors/app-error.js";
import { findBranchById } from "../repositories/branch.repository.js";
import {
  createCar,
  findCarById,
  findCarByReferenceNumber,
  findCarBySlug,
  findCarByVin,
  findPublishedCarBySlug,
  findPublishedCars,
  updateCar,
  type Car,
} from "../repositories/car.repository.js";
import type {
  CreateCarInput,
  PublicCarsQuery,
  UpdateCarInput,
} from "../validators/car.validator.js";

export interface PaginatedCars {
  cars: Car[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getPublicCars = async (
  query: PublicCarsQuery,
): Promise<PaginatedCars> => {
  const result = await findPublishedCars(query);

  return {
    cars: result.cars,
    pagination: {
      page: query.page,
      limit: query.limit,
      total: result.total,
      totalPages:
        result.total === 0
          ? 0
          : Math.ceil(result.total / query.limit),
    },
  };
};

export const getPublicCar = async (
  slug: string,
): Promise<Car> => {
  const car = await findPublishedCarBySlug(slug);

  if (!car) {
    throw new AppError({
      statusCode: 404,
      code: "CAR_NOT_FOUND",
      message: "Car not found.",
    });
  }

  return car;
};

const validateUniqueFields = async (
  input: CreateCarInput | UpdateCarInput,
  excludedId?: number,
): Promise<void> => {
  if (input.reference_number !== undefined) {
    const duplicate =
      await findCarByReferenceNumber(
        input.reference_number,
        excludedId,
      );

    if (duplicate) {
      throw new AppError({
        statusCode: 409,
        code: "CAR_REFERENCE_ALREADY_EXISTS",
        message:
          "A car with this reference number already exists.",
      });
    }
  }

  if (input.slug !== undefined) {
    const duplicate = await findCarBySlug(
      input.slug,
      excludedId,
    );

    if (duplicate) {
      throw new AppError({
        statusCode: 409,
        code: "CAR_SLUG_ALREADY_EXISTS",
        message:
          "A car with this slug already exists.",
      });
    }
  }

  if (
    input.vin !== undefined &&
    input.vin !== null
  ) {
    const duplicate = await findCarByVin(
      input.vin,
      excludedId,
    );

    if (duplicate) {
      throw new AppError({
        statusCode: 409,
        code: "CAR_VIN_ALREADY_EXISTS",
        message:
          "A car with this VIN already exists.",
      });
    }
  }
};

const validateBranch = async (
  branchId: number,
): Promise<void> => {
  const branch = await findBranchById(branchId);

  if (!branch || !branch.is_active) {
    throw new AppError({
      statusCode: 400,
      code: "INVALID_CAR_BRANCH",
      message:
        "The selected branch does not exist or is inactive.",
    });
  }
};

export const createCarForAdmin = async (
  input: CreateCarInput,
  admin: {
    id: number;
    adminRole?: "super_admin" | "branch_admin";
    branchId?: number | null;
  },
): Promise<Car> => {
  await validateUniqueFields(input);
  await validateBranch(input.branch_id);

  if (
    admin.adminRole === "branch_admin" &&
    admin.branchId !== input.branch_id
  ) {
    throw new AppError({
      statusCode: 403,
      code: "BRANCH_SCOPE_VIOLATION",
      message:
        "Branch administrators can create cars only for their assigned branch.",
    });
  }

  return createCar(input, admin.id);
};

export const updateCarForAdmin = async (
  carId: number,
  input: UpdateCarInput,
  admin: {
    adminRole?: "super_admin" | "branch_admin";
    branchId?: number | null;
  },
): Promise<Car> => {
  const existingCar = await findCarById(carId);

  if (!existingCar) {
    throw new AppError({
      statusCode: 404,
      code: "CAR_NOT_FOUND",
      message: "Car not found.",
    });
  }

  if (
    admin.adminRole === "branch_admin" &&
    admin.branchId !== existingCar.branch_id
  ) {
    throw new AppError({
      statusCode: 403,
      code: "BRANCH_SCOPE_VIOLATION",
      message:
        "Branch administrators can manage cars only in their assigned branch.",
    });
  }

  if (input.branch_id !== undefined) {
    await validateBranch(input.branch_id);

    if (
      admin.adminRole === "branch_admin" &&
      admin.branchId !== input.branch_id
    ) {
      throw new AppError({
        statusCode: 403,
        code: "BRANCH_SCOPE_VIOLATION",
        message:
          "Branch administrators cannot move cars to another branch.",
      });
    }
  }

  await validateUniqueFields(input, carId);

  await updateCar(carId, input);

  const updatedCar = await findCarById(carId);

  if (!updatedCar) {
    throw new Error(
      "The updated car could not be retrieved.",
    );
  }

  return updatedCar;
};