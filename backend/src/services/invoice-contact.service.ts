import { AppError } from "../errors/app-error.js";

import {
  countInvoicesForContact,
  createInvoiceContact,
  deleteInvoiceContact,
  findInvoiceContactById,
  findInvoiceContacts,
  updateInvoiceContact,
  type InvoiceContact,
} from "../repositories/invoice-contact.repository.js";

import type {
  CreateInvoiceContactInput,
  InvoiceContactsQuery,
  UpdateInvoiceContactInput,
} from "../validators/invoice-contact.validator.js";

/* =========================================================
   TYPES
   ========================================================= */

export interface PaginatedInvoiceContacts {
  contacts: InvoiceContact[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/* =========================================================
   CREATE CONTACT
   ========================================================= */

export const createInvoiceContactForAdmin = async (
  input: CreateInvoiceContactInput,
): Promise<InvoiceContact> => {
  return createInvoiceContact(input);
};

/* =========================================================
   LIST / SEARCH CONTACTS
   ========================================================= */

export const getInvoiceContactsForAdmin = async (
  query: InvoiceContactsQuery,
): Promise<PaginatedInvoiceContacts> => {
  const result = await findInvoiceContacts(query);

  return {
    contacts: result.contacts,

    pagination: {
      page: query.page,
      limit: query.limit,
      total: result.total,
      totalPages:
        result.total === 0
          ? 0
          : Math.ceil(result.total / query.limit),
    },
  };
};

/* =========================================================
   GET CONTACT
   ========================================================= */

export const getInvoiceContactForAdmin = async (
  contactId: number,
): Promise<InvoiceContact> => {
  const contact = await findInvoiceContactById(contactId);

  if (!contact) {
    throw new AppError({
      statusCode: 404,
      code: "INVOICE_CONTACT_NOT_FOUND",
      message: "Invoice contact not found.",
    });
  }

  return contact;
};

/* =========================================================
   UPDATE CONTACT
   ========================================================= */

export const updateInvoiceContactForAdmin = async (
  contactId: number,
  input: UpdateInvoiceContactInput,
): Promise<InvoiceContact> => {
  await getInvoiceContactForAdmin(contactId);

  await updateInvoiceContact(contactId, input);

  return getInvoiceContactForAdmin(contactId);
};

/* =========================================================
   DELETE CONTACT
   ========================================================= */

export const deleteInvoiceContactForAdmin = async (
  contactId: number,
): Promise<void> => {
  await getInvoiceContactForAdmin(contactId);

  const invoiceCount = await countInvoicesForContact(
    contactId,
  );

  if (invoiceCount > 0) {
    throw new AppError({
      statusCode: 409,
      code: "INVOICE_CONTACT_HAS_INVOICES",
      message:
        "This contact cannot be deleted because they have archived invoices.",
    });
  }

  const deleted = await deleteInvoiceContact(contactId);

  if (!deleted) {
    throw new AppError({
      statusCode: 404,
      code: "INVOICE_CONTACT_NOT_FOUND",
      message: "Invoice contact not found.",
    });
  }
};