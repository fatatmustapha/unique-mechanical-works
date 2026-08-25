import { z } from "zod";

export const testimonialIdParamSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive("Testimonial ID must be a positive integer."),
});

export const createTestimonialSchema = z.object({
  branch_id: z
    .number()
    .int()
    .positive("Branch ID must be a positive integer.")
    .nullable()
    .optional(),

  service_id: z
    .number()
    .int()
    .positive("Service ID must be a positive integer.")
    .nullable()
    .optional(),

  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1.")
    .max(5, "Rating must not exceed 5."),

  comment: z
    .string()
    .trim()
    .min(1, "Comment is required.")
    .max(
      3000,
      "Comment must not exceed 3000 characters.",
    ),
});

export const adminTestimonialsQuerySchema = z.object({
  status: z
    .enum([
      "pending",
      "approved",
      "rejected",
    ])
    .optional(),

  branch_id: z.coerce
    .number()
    .int()
    .positive()
    .optional(),

  service_id: z.coerce
    .number()
    .int()
    .positive()
    .optional(),

  page: z.coerce
    .number()
    .int()
    .positive()
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20),
});

export const reviewTestimonialSchema = z.object({
  decision: z.enum([
    "approved",
    "rejected",
  ]),
});

export type CreateTestimonialInput = z.infer<
  typeof createTestimonialSchema
>;

export type AdminTestimonialsQuery = z.infer<
  typeof adminTestimonialsQuerySchema
>;

export type ReviewTestimonialInput = z.infer<
  typeof reviewTestimonialSchema
>;