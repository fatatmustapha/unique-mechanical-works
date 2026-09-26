import { z } from "zod";

const normalizePhone = (phone: string) =>
  phone.replace(/[\s()-]/g, "");

const phoneSchema = z
  .string()
  .trim()
  .min(7, "A valid phone number is required.")
  .max(30, "Phone number must not exceed 30 characters.")
  .transform(normalizePhone)
  .refine(
    (phone) => /^\+?\d+$/.test(phone),
    "Phone number may only contain digits and an optional leading +.",
  );

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

  phone: phoneSchema,

  email: z
    .string()
    .trim()
    .email("A valid email address is required.")
    .max(150, "Email must not exceed 150 characters.")
    .transform((email) => email.toLowerCase())
    .optional(),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters.")
    .max(72, "Password must not exceed 72 characters."),
});

export const customerLoginSchema = z.object({
  phone: phoneSchema,

  password: z
    .string()
    .min(1, "Password is required.")
    .max(72, "Password must not exceed 72 characters."),
});

export const adminLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("A valid email address is required.")
    .max(150, "Email must not exceed 150 characters.")
    .transform((email) => email.toLowerCase()),

  password: z
    .string()
    .min(1, "Password is required.")
    .max(72, "Password must not exceed 72 characters."),
});

export type CustomerRegistrationInput = z.infer<
  typeof customerRegistrationSchema
>;

export type CustomerLoginInput = z.infer<
  typeof customerLoginSchema
>;

export type AdminLoginInput = z.infer<
  typeof adminLoginSchema
>;