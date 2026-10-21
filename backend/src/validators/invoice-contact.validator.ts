import { z } from "zod";

/* =========================================================
   CONTACT TYPES
   ========================================================= */

export const invoiceContactTypeSchema = z.enum([
  "walk_in_customer",
  "supplier",
]);

/* =========================================================
   CREATE CONTACT
   ========================================================= */

export const createInvoiceContactSchema = z.object({
  contact_type: invoiceContactTypeSchema,

  name: z.string().trim().min(2).max(150),

  phone: z
    .string()
    .trim()
    .max(30)
    .nullable()
    .optional(),

  address: z
    .string()
    .trim()
    .max(255)
    .nullable()
    .optional(),

  notes: z
    .string()
    .trim()
    .max(5000)
    .nullable()
    .optional(),
});

/* =========================================================
   UPDATE CONTACT
   ========================================================= */

export const updateInvoiceContactSchema =
  createInvoiceContactSchema
    .omit({ contact_type: true })
    .partial()
    .refine(
      (data) => Object.keys(data).length > 0,
      "At least one field must be provided.",
    );

/* =========================================================
   CONTACT ID
   ========================================================= */

export const invoiceContactIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/* =========================================================
   LIST / SEARCH CONTACTS
   ========================================================= */

export const invoiceContactsQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .max(150)
    .optional(),

  contact_type: invoiceContactTypeSchema.optional(),

  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(20),
});

/* =========================================================
   TYPES
   ========================================================= */

export type InvoiceContactType = z.infer<
  typeof invoiceContactTypeSchema
>;

export type CreateInvoiceContactInput = z.infer<
  typeof createInvoiceContactSchema
>;

export type UpdateInvoiceContactInput = z.infer<
  typeof updateInvoiceContactSchema
>;

export type InvoiceContactsQuery = z.infer<
  typeof invoiceContactsQuerySchema
>;