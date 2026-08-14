import { z } from "zod";

const nullableOptionalString = (max: number) =>
  z.string().trim().max(max).nullable().optional();

export const branchIdParamSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive("Branch ID must be a positive integer."),
});

export const createBranchSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Branch name is required.")
    .max(100, "Branch name must not exceed 100 characters."),

  city: z
    .string()
    .trim()
    .min(1, "City is required.")
    .max(100, "City must not exceed 100 characters."),

  state: nullableOptionalString(100),

  address: z
    .string()
    .trim()
    .min(1, "Address is required.")
    .max(255, "Address must not exceed 255 characters."),

  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required.")
    .max(30, "Phone number must not exceed 30 characters."),

  whatsapp_number: nullableOptionalString(30),

  email: z
    .string()
    .trim()
    .email("A valid email address is required.")
    .max(150, "Email must not exceed 150 characters.")
    .transform((email) => email.toLowerCase())
    .nullable()
    .optional(),

  opening_hours: nullableOptionalString(255),

  google_maps_url: z
    .string()
    .trim()
    .url("A valid Google Maps URL is required.")
    .max(500, "Google Maps URL must not exceed 500 characters.")
    .nullable()
    .optional(),

  opened_year: z
    .number()
    .int()
    .min(1900)
    .max(2100)
    .nullable()
    .optional(),
});

export const updateBranchSchema = createBranchSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one branch field must be supplied.",
  });

export const updateBranchStatusSchema = z.object({
  is_active: z.boolean(),
});

export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
export type UpdateBranchStatusInput = z.infer<
  typeof updateBranchStatusSchema
>;