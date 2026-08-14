import { z } from "zod";

export const branchServiceParamsSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive("Service ID must be a positive integer."),

  branchId: z.coerce
    .number()
    .int()
    .positive("Branch ID must be a positive integer."),
});

export const branchServiceServiceIdParamSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive("Service ID must be a positive integer."),
});

export const createBranchServiceSchema = z
  .object({
    branch_id: z
      .number()
      .int()
      .positive("Branch ID must be a positive integer."),

    estimated_price_min: z
      .number()
      .nonnegative("Minimum estimated price must be zero or greater.")
      .nullable()
      .optional(),

    estimated_price_max: z
      .number()
      .nonnegative("Maximum estimated price must be zero or greater.")
      .nullable()
      .optional(),

    is_available: z.boolean().optional().default(true),
  })
  .refine(
    (data) =>
      data.estimated_price_min == null ||
      data.estimated_price_max == null ||
      data.estimated_price_min <= data.estimated_price_max,
    {
      message:
        "Minimum estimated price must not exceed maximum estimated price.",
      path: ["estimated_price_max"],
    },
  );

export const updateBranchServiceSchema = z
  .object({
    estimated_price_min: z
      .number()
      .nonnegative("Minimum estimated price must be zero or greater.")
      .nullable()
      .optional(),

    estimated_price_max: z
      .number()
      .nonnegative("Maximum estimated price must be zero or greater.")
      .nullable()
      .optional(),

    is_available: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one branch-service field must be supplied.",
  })
  .refine(
    (data) =>
      data.estimated_price_min == null ||
      data.estimated_price_max == null ||
      data.estimated_price_min <= data.estimated_price_max,
    {
      message:
        "Minimum estimated price must not exceed maximum estimated price.",
      path: ["estimated_price_max"],
    },
  );

export type CreateBranchServiceInput = z.infer<
  typeof createBranchServiceSchema
>;

export type UpdateBranchServiceInput = z.infer<
  typeof updateBranchServiceSchema
>;