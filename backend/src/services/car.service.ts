import { AppError } from "../errors/app-error.js";

import { findBranchById } from "../repositories/branch.repository.js";

import {
  createCar,
  findAdminCars,
  findCarById,
  findCarByReferenceNumber,
  findCarBySlug,
  findCarByVin,
  findPublishedCarBySlug,
  findPublishedCars,
  permanentlyDeleteCar,
  updateCar,
  updateCarFeaturedStatus,
  updateCarPublicationStatus,
  updateCarSaleStatus,
  type Car,
} from "../repositories/car.repository.js";

import type {
  AdminCarsQuery,
  CreateCarInput,
  PublicCarsQuery,
  UpdateCarInput,
} from "../validators/car.validator.js";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

export interface PaginatedCars {
  cars: Car[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type AdminScope = {
  id?: number;

  adminRole?:
    | "super_admin"
    | "branch_admin";

  branchId?: number | null;
};

/*
|--------------------------------------------------------------------------
| PUBLIC CAR LIST
|--------------------------------------------------------------------------
*/

export const getPublicCars = async (
  query: PublicCarsQuery,
): Promise<PaginatedCars> => {
  const result =
    await findPublishedCars(query);

  return {
    cars: result.cars,

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

/*
|--------------------------------------------------------------------------
| PUBLIC CAR DETAILS
|--------------------------------------------------------------------------
*/

export const getPublicCar = async (
  slug: string,
): Promise<Car> => {
  const car =
    await findPublishedCarBySlug(
      slug,
    );

  if (!car) {
    throw new AppError({
      statusCode: 404,
      code: "CAR_NOT_FOUND",
      message: "Car not found.",
    });
  }

  return car;
};

/*
|--------------------------------------------------------------------------
| ADMIN CAR LIST
|--------------------------------------------------------------------------
*/

export const getAdminCars = async (
  query: AdminCarsQuery,
  admin: AdminScope,
): Promise<PaginatedCars> => {
  let scopedBranchId:
    | number
    | undefined;

  if (
    admin.adminRole ===
    "branch_admin"
  ) {
    if (
      admin.branchId === null ||
      admin.branchId === undefined
    ) {
      throw new AppError({
        statusCode: 403,
        code:
          "BRANCH_ADMIN_NOT_ASSIGNED",

        message:
          "This branch administrator is not assigned to a branch.",
      });
    }

    scopedBranchId =
      admin.branchId;
  }

  const result =
    await findAdminCars(
      query,
      scopedBranchId,
    );

  return {
    cars: result.cars,

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

/*
|--------------------------------------------------------------------------
| ADMIN CAR DETAILS
|--------------------------------------------------------------------------
*/

export const getAdminCar = async (
  carId: number,
  admin: AdminScope,
): Promise<Car> => {
  const car =
    await findCarById(carId);

  if (!car) {
    throw new AppError({
      statusCode: 404,
      code: "CAR_NOT_FOUND",
      message: "Car not found.",
    });
  }

  if (
    admin.adminRole ===
      "branch_admin" &&
    admin.branchId !==
      car.branch_id
  ) {
    throw new AppError({
      statusCode: 403,
      code:
        "BRANCH_SCOPE_VIOLATION",

      message:
        "Branch administrators can manage cars only in their assigned branch.",
    });
  }

  return car;
};

/*
|--------------------------------------------------------------------------
| UNIQUE FIELD VALIDATION
|--------------------------------------------------------------------------
*/

const validateUniqueFields =
  async (
    input:
      | CreateCarInput
      | UpdateCarInput,

    excludedId?: number,
  ): Promise<void> => {
    if (
      input.reference_number !==
      undefined
    ) {
      const duplicate =
        await findCarByReferenceNumber(
          input.reference_number,
          excludedId,
        );

      if (duplicate) {
        throw new AppError({
          statusCode: 409,

          code:
            "CAR_REFERENCE_ALREADY_EXISTS",

          message:
            "A car with this reference number already exists.",
        });
      }
    }

    if (
      input.slug !== undefined
    ) {
      const duplicate =
        await findCarBySlug(
          input.slug,
          excludedId,
        );

      if (duplicate) {
        throw new AppError({
          statusCode: 409,

          code:
            "CAR_SLUG_ALREADY_EXISTS",

          message:
            "A car with this slug already exists.",
        });
      }
    }

    if (
      input.vin !== undefined &&
      input.vin !== null
    ) {
      const duplicate =
        await findCarByVin(
          input.vin,
          excludedId,
        );

      if (duplicate) {
        throw new AppError({
          statusCode: 409,

          code:
            "CAR_VIN_ALREADY_EXISTS",

          message:
            "A car with this VIN already exists.",
        });
      }
    }
  };

/*
|--------------------------------------------------------------------------
| BRANCH VALIDATION
|--------------------------------------------------------------------------
*/

const validateBranch =
  async (
    branchId: number,
  ): Promise<void> => {
    const branch =
      await findBranchById(
        branchId,
      );

    if (
      !branch ||
      !branch.is_active
    ) {
      throw new AppError({
        statusCode: 400,

        code:
          "INVALID_CAR_BRANCH",

        message:
          "The selected branch does not exist or is inactive.",
      });
    }
  };

/*
|--------------------------------------------------------------------------
| CREATE CAR
|--------------------------------------------------------------------------
*/

export const createCarForAdmin =
  async (
    input: CreateCarInput,

    admin: {
      id: number;

      adminRole?:
        | "super_admin"
        | "branch_admin";

      branchId?:
        | number
        | null;
    },
  ): Promise<Car> => {
    await validateUniqueFields(
      input,
    );

    await validateBranch(
      input.branch_id,
    );

    if (
      admin.adminRole ===
        "branch_admin" &&
      admin.branchId !==
        input.branch_id
    ) {
      throw new AppError({
        statusCode: 403,

        code:
          "BRANCH_SCOPE_VIOLATION",

        message:
          "Branch administrators can create cars only for their assigned branch.",
      });
    }

    return createCar(
      input,
      admin.id,
    );
  };

/*
|--------------------------------------------------------------------------
| UPDATE CAR
|--------------------------------------------------------------------------
*/

export const updateCarForAdmin =
  async (
    carId: number,

    input: UpdateCarInput,

    admin: {
      adminRole?:
        | "super_admin"
        | "branch_admin";

      branchId?:
        | number
        | null;
    },
  ): Promise<Car> => {
    const existingCar =
      await findCarById(carId);

    if (!existingCar) {
      throw new AppError({
        statusCode: 404,
        code: "CAR_NOT_FOUND",
        message: "Car not found.",
      });
    }

    if (
      admin.adminRole ===
        "branch_admin" &&
      admin.branchId !==
        existingCar.branch_id
    ) {
      throw new AppError({
        statusCode: 403,

        code:
          "BRANCH_SCOPE_VIOLATION",

        message:
          "Branch administrators can manage cars only in their assigned branch.",
      });
    }

    if (
      input.branch_id !==
      undefined
    ) {
      await validateBranch(
        input.branch_id,
      );

      if (
        admin.adminRole ===
          "branch_admin" &&
        admin.branchId !==
          input.branch_id
      ) {
        throw new AppError({
          statusCode: 403,

          code:
            "BRANCH_SCOPE_VIOLATION",

          message:
            "Branch administrators cannot move cars to another branch.",
        });
      }
    }

    await validateUniqueFields(
      input,
      carId,
    );

    await updateCar(
      carId,
      input,
    );

    const updatedCar =
      await findCarById(carId);

    if (!updatedCar) {
      throw new Error(
        "The updated car could not be retrieved.",
      );
    }

    return updatedCar;
  };

/*
|--------------------------------------------------------------------------
| MANAGEABLE CAR HELPER
|--------------------------------------------------------------------------
*/

const getManageableCar =
  async (
    carId: number,
    admin: AdminScope,
  ): Promise<Car> => {
    const car =
      await findCarById(carId);

    if (!car) {
      throw new AppError({
        statusCode: 404,
        code: "CAR_NOT_FOUND",
        message: "Car not found.",
      });
    }

    if (
      admin.adminRole ===
        "branch_admin" &&
      admin.branchId !==
        car.branch_id
    ) {
      throw new AppError({
        statusCode: 403,

        code:
          "BRANCH_SCOPE_VIOLATION",

        message:
          "Branch administrators can manage cars only in their assigned branch.",
      });
    }

    return car;
  };

/*
|--------------------------------------------------------------------------
| PUBLISH CAR
|--------------------------------------------------------------------------
*/

export const publishCar =
  async (
    carId: number,
    admin: AdminScope,
  ): Promise<Car> => {
    const car =
      await getManageableCar(
        carId,
        admin,
      );

    if (
      car.publication_status ===
      "archived"
    ) {
      throw new AppError({
        statusCode: 409,

        code:
          "ARCHIVED_CAR_CANNOT_BE_PUBLISHED",

        message:
          "An archived car must be restored before it can be published.",
      });
    }

    await updateCarPublicationStatus(
      carId,
      "published",
    );

    const updatedCar =
      await findCarById(carId);

    if (!updatedCar) {
      throw new Error(
        "The published car could not be retrieved.",
      );
    }

    return updatedCar;
  };

/*
|--------------------------------------------------------------------------
| ARCHIVE CAR
|--------------------------------------------------------------------------
*/

export const archiveCar =
  async (
    carId: number,
    admin: AdminScope,
  ): Promise<Car> => {
    await getManageableCar(
      carId,
      admin,
    );

    await updateCarPublicationStatus(
      carId,
      "archived",
    );

    const updatedCar =
      await findCarById(carId);

    if (!updatedCar) {
      throw new Error(
        "The archived car could not be retrieved.",
      );
    }

    return updatedCar;
  };

/*
|--------------------------------------------------------------------------
| FEATURED CAR
|--------------------------------------------------------------------------
*/

export const toggleFeaturedCar =
  async (
    carId: number,
    admin: AdminScope,
  ): Promise<Car> => {
    const car =
      await getManageableCar(
        carId,
        admin,
      );

    await updateCarFeaturedStatus(
      carId,
      !car.is_featured,
    );

    const updatedCar =
      await findCarById(carId);

    if (!updatedCar) {
      throw new Error(
        "The updated car could not be retrieved.",
      );
    }

    return updatedCar;
  };

/*
|--------------------------------------------------------------------------
| MARK SOLD
|--------------------------------------------------------------------------
*/

export const markCarSold =
  async (
    carId: number,
    admin: AdminScope,
  ): Promise<Car> => {
    await getManageableCar(
      carId,
      admin,
    );

    await updateCarSaleStatus(
      carId,
      "sold",
    );

    const updatedCar =
      await findCarById(carId);

    if (!updatedCar) {
      throw new Error(
        "The updated car could not be retrieved.",
      );
    }

    return updatedCar;
  };

/*
|--------------------------------------------------------------------------
| MARK AVAILABLE
|--------------------------------------------------------------------------
*/

export const markCarAvailable =
  async (
    carId: number,
    admin: AdminScope,
  ): Promise<Car> => {
    await getManageableCar(
      carId,
      admin,
    );

    await updateCarSaleStatus(
      carId,
      "available",
    );

    const updatedCar =
      await findCarById(carId);

    if (!updatedCar) {
      throw new Error(
        "The updated car could not be retrieved.",
      );
    }

    return updatedCar;
  };

/*
|--------------------------------------------------------------------------
| DELETE CAR
|--------------------------------------------------------------------------
*/

export const deleteCar =
  async (
    carId: number,
    admin: AdminScope,
  ): Promise<void> => {
    const car =
      await getManageableCar(
        carId,
        admin,
      );

    if (
      car.publication_status !==
      "draft"
    ) {
      throw new AppError({
        statusCode: 409,

        code:
          "CAR_DELETE_NOT_ALLOWED",

        message:
          "Only draft cars may be permanently deleted. Published or archived cars should remain in history.",
      });
    }

    const deleted =
      await permanentlyDeleteCar(
        carId,
      );

    if (!deleted) {
      throw new AppError({
        statusCode: 404,
        code: "CAR_NOT_FOUND",
        message: "Car not found.",
      });
    }
  };