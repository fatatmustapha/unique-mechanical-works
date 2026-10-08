import { z } from "zod";

const optionalNullableId = z.preprocess(
  (value) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return null;
    }

    return value;
  },
  z.coerce.number().int().positive().nullable(),
);

const optionalBoolean = z.preprocess(
  (value) => {
    if (value === undefined) {
      return undefined;
    }

    if (value === true || value === "true") {
      return true;
    }

    if (value === false || value === "false") {
      return false;
    }

    return value;
  },
  z.boolean().optional(),
);

export const showcaseIdParamSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive("Showcase ID must be a positive integer."),
});

export const showcaseImageIdParamSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive("Showcase ID must be a positive integer."),

  imageId: z.coerce
    .number()
    .int()
    .positive("Image ID must be a positive integer."),
});

export const createServiceShowcaseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Showcase title is required.")
    .max(150, "Showcase title must not exceed 150 characters."),

  description: z
    .string()
    .trim()
    .max(500, "Description must not exceed 500 characters.")
    .nullable()
    .optional(),

  service_id: optionalNullableId.optional(),

  branch_id: optionalNullableId.optional(),

  is_active: optionalBoolean.default(true),
});

export const updateServiceShowcaseSchema =
  createServiceShowcaseSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one showcase field must be supplied.",
    });

export const updateServiceShowcaseStatusSchema = z.object({
  is_active: z.boolean(),
});

export type CreateServiceShowcaseInput = z.infer<
  typeof createServiceShowcaseSchema
>;

export type UpdateServiceShowcaseInput = z.infer<
  typeof updateServiceShowcaseSchema
>;

export type UpdateServiceShowcaseStatusInput = z.infer<
  typeof updateServiceShowcaseStatusSchema
>;