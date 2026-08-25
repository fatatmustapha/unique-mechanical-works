import { AppError } from "../errors/app-error.js";
import {
  createCustomerTestimonial,
  deleteTestimonial,
  findAdminTestimonials,
  findApprovedTestimonials,
  findCustomerTestimonials,
  findTestimonialById,
  reviewTestimonial,
  type Testimonial,
} from "../repositories/testimonial.repository.js";
import type {
  AdminTestimonialsQuery,
  CreateTestimonialInput,
  ReviewTestimonialInput,
} from "../validators/testimonial.validator.js";

type TestimonialAdminScope = {
  id: number;
  adminRole?: "super_admin" | "branch_admin";
  branchId?: number | null;
};

export interface PaginatedAdminTestimonials {
  testimonials: Testimonial[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/* =========================================================
   PUBLIC
   ========================================================= */

export const getPublicTestimonials = async (): Promise<
  Testimonial[]
> => {
  return findApprovedTestimonials();
};

/* =========================================================
   CUSTOMER
   ========================================================= */

export const getMyTestimonials = async (
  customerId: number,
): Promise<Testimonial[]> => {
  return findCustomerTestimonials(customerId);
};

export const createMyTestimonial = async (
  customerId: number,
  input: CreateTestimonialInput,
): Promise<Testimonial> => {
  return createCustomerTestimonial(
    customerId,
    input,
  );
};

/* =========================================================
   ADMIN
   ========================================================= */

export const getTestimonialsForAdmin = async (
  query: AdminTestimonialsQuery,
  admin: TestimonialAdminScope,
): Promise<PaginatedAdminTestimonials> => {
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
          "Branch administrators can manage testimonials only for their assigned branch.",
      });
    }

    branchId = admin.branchId;
  }

  const result = await findAdminTestimonials({
    ...(query.status !== undefined
      ? { status: query.status }
      : {}),

    ...(branchId !== undefined
      ? { branchId }
      : {}),

    ...(query.service_id !== undefined
      ? { serviceId: query.service_id }
      : {}),

    page: query.page,
    limit: query.limit,
  });

  return {
    testimonials: result.testimonials,

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

export const reviewTestimonialForAdmin = async (
  testimonialId: number,
  input: ReviewTestimonialInput,
  admin: TestimonialAdminScope,
): Promise<Testimonial> => {
  const testimonial =
    await findTestimonialById(
      testimonialId,
    );

  if (!testimonial) {
    throw new AppError({
      statusCode: 404,
      code: "TESTIMONIAL_NOT_FOUND",
      message: "Testimonial not found.",
    });
  }

  if (
    admin.adminRole === "branch_admin" &&
    testimonial.branch_id !==
      admin.branchId
  ) {
    throw new AppError({
      statusCode: 403,
      code: "BRANCH_SCOPE_VIOLATION",
      message:
        "Branch administrators can manage testimonials only for their assigned branch.",
    });
  }

  const updated =
    await reviewTestimonial(
      testimonialId,
      admin.id,
      input.decision,
    );

  if (!updated) {
    throw new AppError({
      statusCode: 404,
      code: "TESTIMONIAL_NOT_FOUND",
      message: "Testimonial not found.",
    });
  }

  const reviewed =
    await findTestimonialById(
      testimonialId,
    );

  if (!reviewed) {
    throw new Error(
      "The reviewed testimonial could not be retrieved.",
    );
  }

  return reviewed;
};

export const deleteTestimonialForAdmin = async (
  testimonialId: number,
  admin: TestimonialAdminScope,
): Promise<void> => {
  const testimonial =
    await findTestimonialById(
      testimonialId,
    );

  if (!testimonial) {
    throw new AppError({
      statusCode: 404,
      code: "TESTIMONIAL_NOT_FOUND",
      message: "Testimonial not found.",
    });
  }

  if (
    admin.adminRole === "branch_admin" &&
    testimonial.branch_id !==
      admin.branchId
  ) {
    throw new AppError({
      statusCode: 403,
      code: "BRANCH_SCOPE_VIOLATION",
      message:
        "Branch administrators can delete testimonials only for their assigned branch.",
    });
  }

  const deleted =
    await deleteTestimonial(
      testimonialId,
    );

  if (!deleted) {
    throw new AppError({
      statusCode: 404,
      code: "TESTIMONIAL_NOT_FOUND",
      message: "Testimonial not found.",
    });
  }
};