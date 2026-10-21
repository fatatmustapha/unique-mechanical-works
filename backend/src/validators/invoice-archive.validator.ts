import { z } from "zod";

/* =========================================================
   REUSABLE FIELDS
   ========================================================= */

const optionalText = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .nullish()
    .transform((value) => value || null);

const invoiceDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invoice date must use YYYY-MM-DD format.")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);

    return (
      !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    );
  }, "Invalid invoice date.");

const amountSchema = z
  .union([z.number(), z.string().trim().min(1)])
  .nullish()
  .transform((value) => {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === "string" && value.trim() === "") {
      return null;
    }

    return Number(value);
  })
  .refine(
    (value) =>
      value === null ||
      (Number.isFinite(value) &&
        value >= 0 &&
        value <= 9999999999999.99 &&
        Math.round(value * 100) === value * 100),
    "Amount must be a valid non-negative value with at most two decimal places.",
  );

/* =========================================================
   CREATE ARCHIVED INVOICE
   ========================================================= */

export const createInvoiceArchiveSchema = z
  .object({
    customer_id: z.coerce.number().int().positive().nullish(),

    contact_id: z.coerce.number().int().positive().nullish(),

    title: z.string().trim().min(2).max(200),

    invoice_number: optionalText(100),

    invoice_date: invoiceDateSchema,

    amount: amountSchema,

    description: optionalText(5000),
  })
  .refine((data) => (data.customer_id != null) !== (data.contact_id != null), {
    message:
      "Select either a registered customer or an invoice contact, not both.",
    path: ["customer_id"],
  });

/* =========================================================
   UPDATE ARCHIVED INVOICE
   ========================================================= */

export const updateInvoiceArchiveSchema = z
  .object({
    title: z.string().trim().min(2).max(200).optional(),

    invoice_number: optionalText(100).optional(),

    invoice_date: invoiceDateSchema.optional(),

    amount: amountSchema.optional(),

    description: optionalText(5000).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided.",
  );

/* =========================================================
   ARCHIVE ID
   ========================================================= */

export const invoiceArchiveIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/* =========================================================
   FILE ID
   ========================================================= */

export const invoiceArchiveFileIdParamSchema = z.object({
  fileId: z.coerce.number().int().positive(),
});

/* =========================================================
   LIST / SEARCH ARCHIVED INVOICES
   ========================================================= */

export const invoiceArchiveQuerySchema = z
  .object({
    search: z.string().trim().max(150).optional(),

    owner_type: z
      .enum(["registered_customer", "walk_in_customer", "supplier", "customer"])
      .optional(),

    customer_id: z.coerce.number().int().positive().optional(),

    contact_id: z.coerce.number().int().positive().optional(),

    date_from: invoiceDateSchema.optional(),

    date_to: invoiceDateSchema.optional(),

    page: z.coerce.number().int().positive().default(1),

    limit: z.coerce.number().int().positive().max(100).default(20),
  })
  .refine(
    (data) =>
      !data.date_from || !data.date_to || data.date_from <= data.date_to,
    {
      message: "Start date cannot be after end date.",
      path: ["date_to"],
    },
  );

/* =========================================================
   TYPES
   ========================================================= */

export type CreateInvoiceArchiveInput = z.infer<
  typeof createInvoiceArchiveSchema
>;

export type UpdateInvoiceArchiveInput = z.infer<
  typeof updateInvoiceArchiveSchema
>;

export type InvoiceArchiveQuery = z.infer<typeof invoiceArchiveQuerySchema>;
