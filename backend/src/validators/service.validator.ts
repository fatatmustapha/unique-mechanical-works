import { z } from "zod";

const nullableOptionalString = (max: number) =>
  z.string().trim().max(max).nullable().optional();

export const serviceIdParamSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive("Service ID must be a positive integer."),
});

export const createServiceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Service name is required.")
    .max(100, "Service name must not exceed 100 characters."),

  slug: z
    .string()
    .trim()
    .min(1, "Service slug is required.")
    .max(150, "Service slug must not exceed 150 characters.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain lowercase letters, numbers, and hyphens only.",
    ),

  category: nullableOptionalString(100),

  short_description: nullableOptionalString(255),

  description: z
    .string()
    .trim()
    .nullable()
    .optional(),

  image_url: nullableOptionalString(500),

  display_order: z
    .number()
    .int()
    .nonnegative("Display order must be zero or greater.")
    .optional()
    .default(0),
});

export const updateServiceSchema = createServiceSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one service field must be supplied.",
  });

export const updateServiceStatusSchema = z.object({
  is_active: z.boolean(),
});

export type CreateServiceInput = z.infer<
  typeof createServiceSchema
>;

export type UpdateServiceInput = z.infer<
  typeof updateServiceSchema
>;

export type UpdateServiceStatusInput = z.infer<
  typeof updateServiceStatusSchema
>;