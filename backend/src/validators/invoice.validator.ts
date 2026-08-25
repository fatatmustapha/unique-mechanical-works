import { z } from "zod";

export const invoiceIdParamSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive("Invoice ID must be a positive integer."),
});

const invoiceItemSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Invoice item description is required.")
    .max(
      255,
      "Invoice item description must not exceed 255 characters.",
    ),

  quantity: z
    .number()
    .positive("Quantity must be greater than zero.")
    .default(1),

  unit_price: z
    .number()
    .nonnegative(
      "Unit price must be zero or greater.",
    ),
});

export const createInvoiceSchema = z.object({
  invoice_number: z
    .string()
    .trim()
    .min(1, "Invoice number is required.")
    .max(
      50,
      "Invoice number must not exceed 50 characters.",
    ),

  customer_id: z
    .number()
    .int()
    .positive(
      "Customer ID must be a positive integer.",
    ),

  appointment_id: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),

  car_id: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),

  discount_amount: z
    .number()
    .nonnegative(
      "Discount must be zero or greater.",
    )
    .optional()
    .default(0),

  currency: z
    .string()
    .trim()
    .length(
      3,
      "Currency must contain exactly 3 characters.",
    )
    .transform((value) =>
      value.toUpperCase(),
    )
    .optional()
    .default("NGN"),

  payment_method: z
    .string()
    .trim()
    .max(50)
    .nullable()
    .optional(),

  due_date: z
    .string()
    .date()
    .nullable()
    .optional(),

  notes: z
    .string()
    .trim()
    .nullable()
    .optional(),

  items: z
    .array(invoiceItemSchema)
    .min(
      1,
      "An invoice must contain at least one item.",
    ),
});

export const updateInvoiceSchema = z
  .object({
    appointment_id: z
      .number()
      .int()
      .positive()
      .nullable()
      .optional(),

    car_id: z
      .number()
      .int()
      .positive()
      .nullable()
      .optional(),

    discount_amount: z
      .number()
      .nonnegative()
      .optional(),

    currency: z
      .string()
      .trim()
      .length(3)
      .transform((value) =>
        value.toUpperCase(),
      )
      .optional(),

    payment_method: z
      .string()
      .trim()
      .max(50)
      .nullable()
      .optional(),

    due_date: z
      .string()
      .date()
      .nullable()
      .optional(),

    notes: z
      .string()
      .trim()
      .nullable()
      .optional(),

    items: z
      .array(invoiceItemSchema)
      .min(1)
      .optional(),
  })
  .refine(
    (data) =>
      Object.keys(data).length > 0,
    {
      message:
        "At least one invoice field must be supplied.",
    },
  );

export const adminInvoicesQuerySchema = z.object({
  customer_id: z.coerce
    .number()
    .int()
    .positive()
    .optional(),

  payment_status: z
    .enum([
      "pending",
      "partial",
      "paid",
    ])
    .optional(),

  page: z.coerce
    .number()
    .int()
    .positive()
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20),
});

export const recordInvoicePaymentSchema = z.object({
  amount: z
    .number()
    .positive(
      "Payment amount must be greater than zero.",
    ),

  payment_method: z
    .string()
    .trim()
    .max(50)
    .nullable()
    .optional(),
});

export type InvoiceItemInput = z.infer<
  typeof invoiceItemSchema
>;

export type CreateInvoiceInput = z.infer<
  typeof createInvoiceSchema
>;

export type UpdateInvoiceInput = z.infer<
  typeof updateInvoiceSchema
>;

export type AdminInvoicesQuery = z.infer<
  typeof adminInvoicesQuerySchema
>;

export type RecordInvoicePaymentInput =
  z.infer<
    typeof recordInvoicePaymentSchema
  >;