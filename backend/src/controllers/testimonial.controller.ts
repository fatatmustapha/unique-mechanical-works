import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { AppError } from "../errors/app-error.js";
import {
  createMyTestimonial,
  deleteTestimonialForAdmin,
  getMyTestimonials,
  getPublicTestimonials,
  getTestimonialsForAdmin,
  reviewTestimonialForAdmin,
} from "../services/testimonial.service.js";
import { sendSuccess } from "../utils/api-response.js";
import {
  adminTestimonialsQuerySchema,
  createTestimonialSchema,
  reviewTestimonialSchema,
  testimonialIdParamSchema,
} from "../validators/testimonial.validator.js";

const getCustomerId = (
  request: Request,
): number => {
  if (
    !request.user ||
    request.user.accountType !== "customer"
  ) {
    throw new AppError({
      statusCode: 401,
      code: "AUTHENTICATION_REQUIRED",
      message:
        "Customer authentication is required.",
    });
  }

  return request.user.id;
};

const getAdminUser = (
  request: Request,
) => {
  if (
    !request.user ||
    request.user.accountType !== "admin"
  ) {
    throw new AppError({
      statusCode: 401,
      code: "AUTHENTICATION_REQUIRED",
      message:
        "Administrator authentication is required.",
    });
  }

  return request.user;
};

/* =========================================================
   PUBLIC
   ========================================================= */

export const getApprovedTestimonials = async (
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const testimonials =
      await getPublicTestimonials();

    sendSuccess(
      response,
      200,
      testimonials,
      "Testimonials retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

/* =========================================================
   CUSTOMER
   ========================================================= */

export const submitTestimonial = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customerId =
      getCustomerId(request);

    const input =
      createTestimonialSchema.parse(
        request.body,
      );

    const testimonial =
      await createMyTestimonial(
        customerId,
        input,
      );

    sendSuccess(
      response,
      201,
      { testimonial },
      "Testimonial submitted successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const getMine = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customerId =
      getCustomerId(request);

    const testimonials =
      await getMyTestimonials(
        customerId,
      );

    sendSuccess(
      response,
      200,
      testimonials,
      "Your testimonials retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

/* =========================================================
   ADMIN
   ========================================================= */

export const getAdminTestimonials = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const admin =
      getAdminUser(request);

    const query =
      adminTestimonialsQuerySchema.parse(
        request.query,
      );

    const result =
      await getTestimonialsForAdmin(
        query,
        admin,
      );

    sendSuccess(
      response,
      200,
      result,
      "Admin testimonials retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const reviewAdminTestimonial = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const admin =
      getAdminUser(request);

    const { id } =
      testimonialIdParamSchema.parse(
        request.params,
      );

    const input =
      reviewTestimonialSchema.parse(
        request.body,
      );

    const testimonial =
      await reviewTestimonialForAdmin(
        id,
        input,
        admin,
      );

    sendSuccess(
      response,
      200,
      { testimonial },
      input.decision === "approved"
        ? "Testimonial approved successfully."
        : "Testimonial rejected successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const deleteAdminTestimonial = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const admin =
      getAdminUser(request);

    const { id } =
      testimonialIdParamSchema.parse(
        request.params,
      );

    await deleteTestimonialForAdmin(
      id,
      admin,
    );

    sendSuccess(
      response,
      200,
      {},
      "Testimonial deleted successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};