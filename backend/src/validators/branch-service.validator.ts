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

export const serviceIdParamSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive("Service ID must be a positive integer."),
});

export const createBranchServiceSchema = z.object({
  branch_id: z
    .number()
    .int()
    .positive("Branch ID must be a positive integer."),

  price: z
    .number()
    .nonnegative("Price must be zero or greater.")
    .nullable()
    .optional(),

  estimated_minutes: z
    .number()
    .int()
    .positive("Estimated minutes must be a positive integer.")
    .nullable()
    .optional(),

  is_available: z.boolean().optional().default(true),
});

export const updateBranchServiceSchema = z
  .object({
    price: z
      .number()
      .nonnegative("Price must be zero or greater.")
      .nullable()
      .optional(),

    estimated_minutes: z
      .number()
      .int()
      .positive("Estimated minutes must be a positive integer.")
      .nullable()
      .optional(),

    is_available: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one branch-service field must be supplied.",
  });

export type CreateBranchServiceInput = z.infer<
  typeof createBranchServiceSchema
>;

export type UpdateBranchServiceInput = z.infer<
  typeof updateBranchServiceSchema
>;
