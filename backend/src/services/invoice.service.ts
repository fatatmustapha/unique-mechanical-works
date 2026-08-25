import { AppError } from "../errors/app-error.js";
import {
  createInvoice,
  findAdminInvoices,
  findCustomerInvoiceById,
  findCustomerInvoices,
  findInvoiceById,
  recordInvoicePayment,
  updateInvoice,
  findInvoiceByNumber,
  type Invoice,
} from "../repositories/invoice.repository.js";
import type {
  AdminInvoicesQuery,
  CreateInvoiceInput,
  RecordInvoicePaymentInput,
  UpdateInvoiceInput,
} from "../validators/invoice.validator.js";

export interface PaginatedAdminInvoices {
  invoices: Invoice[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/* =========================================================
   CUSTOMER INVOICES
   ========================================================= */

export const getMyInvoices = async (customerId: number): Promise<Invoice[]> => {
  return findCustomerInvoices(customerId);
};

export const getMyInvoice = async (
  customerId: number,
  invoiceId: number,
): Promise<Invoice> => {
  const invoice = await findCustomerInvoiceById(invoiceId, customerId);

  if (!invoice) {
    throw new AppError({
      statusCode: 404,
      code: "INVOICE_NOT_FOUND",
      message: "Invoice not found.",
    });
  }

  return invoice;
};

/* =========================================================
   ADMIN INVOICES
   ========================================================= */

export const getInvoicesForAdmin = async (
  query: AdminInvoicesQuery,
): Promise<PaginatedAdminInvoices> => {
  const result = await findAdminInvoices({
    ...(query.customer_id !== undefined
      ? {
          customerId: query.customer_id,
        }
      : {}),

    ...(query.payment_status !== undefined
      ? {
          paymentStatus: query.payment_status,
        }
      : {}),

    page: query.page,
    limit: query.limit,
  });

  return {
    invoices: result.invoices,

    pagination: {
      page: query.page,
      limit: query.limit,
      total: result.total,

      totalPages:
        result.total === 0 ? 0 : Math.ceil(result.total / query.limit),
    },
  };
};

export const getInvoiceForAdmin = async (
  invoiceId: number,
): Promise<Invoice> => {
  const invoice = await findInvoiceById(invoiceId);

  if (!invoice) {
    throw new AppError({
      statusCode: 404,
      code: "INVOICE_NOT_FOUND",
      message: "Invoice not found.",
    });
  }

  return invoice;
};

export const createInvoiceForAdmin = async (
  adminId: number,
  input: CreateInvoiceInput,
): Promise<Invoice> => {
  const duplicate = await findInvoiceByNumber(input.invoice_number);

  if (duplicate !== null) {
    throw new AppError({
      statusCode: 409,
      code: "INVOICE_NUMBER_ALREADY_EXISTS",
      message: "An invoice with this invoice number already exists.",
    });
  }

  return createInvoice(adminId, input);
};

export const updateInvoiceForAdmin = async (
  invoiceId: number,
  input: UpdateInvoiceInput,
): Promise<Invoice> => {
  const existing = await getInvoiceForAdmin(invoiceId);

  if (existing.payment_status === "paid") {
    throw new AppError({
      statusCode: 409,
      code: "PAID_INVOICE_NOT_EDITABLE",
      message: "A fully paid invoice cannot be edited.",
    });
  }

  const invoice = await updateInvoice(invoiceId, input);

  if (invoice.amount_paid > invoice.total_amount) {
    throw new AppError({
      statusCode: 409,
      code: "INVOICE_TOTAL_BELOW_AMOUNT_PAID",
      message:
        "The updated invoice total cannot be lower than the amount already paid.",
    });
  }

  return invoice;
};

export const recordPaymentForAdmin = async (
  invoiceId: number,
  input: RecordInvoicePaymentInput,
): Promise<Invoice> => {
  const existing = await getInvoiceForAdmin(invoiceId);

  if (existing.payment_status === "paid") {
    throw new AppError({
      statusCode: 409,
      code: "INVOICE_ALREADY_PAID",
      message: "This invoice has already been paid in full.",
    });
  }

  const remaining = existing.total_amount - existing.amount_paid;

  if (input.amount > remaining) {
    throw new AppError({
      statusCode: 400,
      code: "PAYMENT_EXCEEDS_BALANCE",
      message:
        "The payment amount cannot exceed the remaining invoice balance.",
    });
  }

  const invoice = await recordInvoicePayment(
    invoiceId,
    input.amount,
    input.payment_method,
  );

  if (!invoice) {
    throw new AppError({
      statusCode: 404,
      code: "INVOICE_NOT_FOUND",
      message: "Invoice not found.",
    });
  }

  return invoice;
};
