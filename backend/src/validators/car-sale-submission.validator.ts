import { z } from "zod";

const currentYear = new Date().getFullYear();

export const carSaleSubmissionIdParamSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive("Submission ID must be a positive integer."),
});

const submissionFieldsSchema = z.object({
  branch_id: z
    .number()
    .int()
    .positive("Branch ID must be a positive integer."),

  make: z
    .string()
    .trim()
    .min(1, "Make is required.")
    .max(50, "Make must not exceed 50 characters."),

  model: z
    .string()
    .trim()
    .min(1, "Model is required.")
    .max(50, "Model must not exceed 50 characters."),

  year: z
    .number()
    .int()
    .min(1900, "Year must be 1900 or later.")
    .max(
      currentYear + 1,
      "Year cannot be more than one year in the future.",
    )
    .nullable()
    .optional(),

  mileage: z
    .number()
    .int()
    .nonnegative("Mileage must be zero or greater.")
    .nullable()
    .optional(),

  condition_type: z
    .enum([
      "New",
      "Nigerian Used",
      "Foreign Used",
    ])
    .nullable()
    .optional(),

  transmission: z
    .enum([
      "Automatic",
      "Manual",
    ])
    .nullable()
    .optional(),

  fuel_type: z
    .enum([
      "Petrol",
      "Diesel",
      "Hybrid",
      "Electric",
    ])
    .nullable()
    .optional(),

  color_exterior: z
    .string()
    .trim()
    .max(
      50,
      "Exterior color must not exceed 50 characters.",
    )
    .nullable()
    .optional(),

  expected_price: z
    .number()
    .positive(
      "Expected price must be greater than zero.",
    )
    .nullable()
    .optional(),

  description: z
    .string()
    .trim()
    .nullable()
    .optional(),

  contact_phone: z
    .string()
    .trim()
    .max(
      30,
      "Contact phone must not exceed 30 characters.",
    )
    .nullable()
    .optional(),
});

export const createCarSaleSubmissionSchema =
  submissionFieldsSchema;

export const updateCarSaleSubmissionSchema =
  submissionFieldsSchema
    .partial()
    .refine(
      (data) =>
        Object.keys(data).length > 0,
      {
        message:
          "At least one submission field must be supplied.",
      },
    );

export const adminCarSaleSubmissionsQuerySchema =
  z.object({
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
      .positive(
        "Branch ID must be a positive integer.",
      )
      .optional(),

    page: z.coerce
      .number()
      .int()
      .positive(
        "Page must be a positive integer.",
      )
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .min(
        1,
        "Limit must be at least 1.",
      )
      .max(
        100,
        "Limit must not exceed 100.",
      )
      .default(20),
  });

export const reviewCarSaleSubmissionSchema =
  z.object({
    decision: z.enum([
      "approved",
      "rejected",
    ]),

    admin_notes: z
      .string()
      .trim()
      .max(
        1000,
        "Admin notes must not exceed 1000 characters.",
      )
      .nullable()
      .optional(),
  });

export type CreateCarSaleSubmissionInput =
  z.infer<
    typeof createCarSaleSubmissionSchema
  >;

export type UpdateCarSaleSubmissionInput =
  z.infer<
    typeof updateCarSaleSubmissionSchema
  >;

export type AdminCarSaleSubmissionsQuery =
  z.infer<
    typeof adminCarSaleSubmissionsQuerySchema
  >;

export type ReviewCarSaleSubmissionInput =
  z.infer<
    typeof reviewCarSaleSubmissionSchema
  >;