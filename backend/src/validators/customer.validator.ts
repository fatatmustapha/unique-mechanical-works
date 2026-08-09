import { z } from "zod";

export const updateCustomerProfileSchema = z
  .object({
    first_name: z
      .string()
      .trim()
      .min(1, "First name is required.")
      .max(50, "First name must not exceed 50 characters.")
      .optional(),

    last_name: z
      .string()
      .trim()
      .min(1, "Last name is required.")
      .max(50, "Last name must not exceed 50 characters.")
      .optional(),

    email: z
      .string()
      .trim()
      .email("A valid email address is required.")
      .max(150, "Email must not exceed 150 characters.")
      .transform((email) => email.toLowerCase())
      .optional(),

    phone: z
      .string()
      .trim()
      .max(30, "Phone number must not exceed 30 characters.")
      .nullable()
      .optional(),

    preferred_branch_id: z
      .number()
      .int()
      .positive("Preferred branch ID must be a positive integer.")
      .nullable()
      .optional(),

    avatar_url: z
      .string()
      .trim()
      .max(500, "Avatar URL must not exceed 500 characters.")
      .nullable()
      .optional(),

    address: z
      .string()
      .trim()
      .max(255, "Address must not exceed 255 characters.")
      .nullable()
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one profile field must be supplied.",
  });

export const customerIdParamSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive("Customer ID must be a positive integer."),
});

export const customerListQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(20),

  search: z
    .string()
    .trim()
    .max(150)
    .optional(),

  is_active: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});

export const updateCustomerStatusSchema = z.object({
  is_active: z.boolean(),
});

export type UpdateCustomerProfileInput = z.infer<
  typeof updateCustomerProfileSchema
>;

export type CustomerListQuery = z.infer<
  typeof customerListQuerySchema
>;

export type UpdateCustomerStatusInput = z.infer<
  typeof updateCustomerStatusSchema
>;