import { z } from "zod";

export const customerRegistrationSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(1, "First name is required.")
    .max(50, "First name must not exceed 50 characters."),

  last_name: z
    .string()
    .trim()
    .min(1, "Last name is required.")
    .max(50, "Last name must not exceed 50 characters."),

  email: z
    .string()
    .trim()
    .email("A valid email address is required.")
    .max(150, "Email must not exceed 150 characters.")
    .transform((email) => email.toLowerCase()),

  phone: z
    .string()
    .trim()
    .max(30, "Phone number must not exceed 30 characters.")
    .optional(),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters.")
    .max(72, "Password must not exceed 72 characters."),

  preferred_branch_id: z
    .number()
    .int()
    .positive("Preferred branch ID must be a positive integer.")
    .optional(),
});

export type CustomerRegistrationInput = z.infer<
  typeof customerRegistrationSchema
>;