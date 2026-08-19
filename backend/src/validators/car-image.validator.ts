import { z } from "zod";

const imageLabelSchema = z.enum([
  "front",
  "back",
  "side",
  "interior",
  "engine",
  "other",
]);

const multipartBoolean = z.preprocess(
  (value: unknown) => {
    if (value === "true" || value === true) {
      return true;
    }

    if (value === "false" || value === false) {
      return false;
    }

    return value;
  },
  z.boolean(),
);

export const carIdImageParamSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive("Car ID must be a positive integer."),
});

export const carImageParamsSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive("Car ID must be a positive integer."),

  imageId: z.coerce
    .number()
    .int()
    .positive("Image ID must be a positive integer."),
});

export const createCarImageSchema = z.object({
  image_url: z
    .string()
    .trim()
    .min(1, "Image URL is required.")
    .max(
      500,
      "Image URL must not exceed 500 characters.",
    ),

  image_label: imageLabelSchema
    .optional()
    .default("other"),

  alt_text: z
    .string()
    .trim()
    .max(
      255,
      "Alt text must not exceed 255 characters.",
    )
    .nullable()
    .optional(),

  is_primary: z
    .boolean()
    .optional()
    .default(false),

  sort_order: z
    .number()
    .int()
    .nonnegative(
      "Sort order must be zero or greater.",
    )
    .optional()
    .default(0),
});

export const uploadCarImageMetadataSchema =
  z.object({
    image_label: imageLabelSchema
      .optional()
      .default("other"),

    alt_text: z
      .string()
      .trim()
      .max(
        255,
        "Alt text must not exceed 255 characters.",
      )
      .nullable()
      .optional(),

    is_primary: multipartBoolean
      .optional()
      .default(false),

    sort_order: z.coerce
      .number()
      .int()
      .nonnegative(
        "Sort order must be zero or greater.",
      )
      .optional()
      .default(0),
  });

export const updateCarImageSchema = z
  .object({
    image_label: imageLabelSchema.optional(),

    alt_text: z
      .string()
      .trim()
      .max(
        255,
        "Alt text must not exceed 255 characters.",
      )
      .nullable()
      .optional(),

    sort_order: z
      .number()
      .int()
      .nonnegative(
        "Sort order must be zero or greater.",
      )
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message:
        "At least one image field must be supplied.",
    },
  );

export const reorderCarImagesSchema = z.object({
  images: z
    .array(
      z.object({
        image_id: z
          .number()
          .int()
          .positive(
            "Image ID must be a positive integer.",
          ),

        sort_order: z
          .number()
          .int()
          .nonnegative(
            "Sort order must be zero or greater.",
          ),
      }),
    )
    .min(
      1,
      "At least one image must be supplied.",
    ),
});

export type CreateCarImageInput = z.infer<
  typeof createCarImageSchema
>;

export type UploadCarImageMetadataInput = z.infer<
  typeof uploadCarImageMetadataSchema
>;

export type UpdateCarImageInput = z.infer<
  typeof updateCarImageSchema
>;

export type ReorderCarImagesInput = z.infer<
  typeof reorderCarImagesSchema
>;