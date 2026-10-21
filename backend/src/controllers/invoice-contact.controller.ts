import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  createInvoiceContactForAdmin,
  deleteInvoiceContactForAdmin,
  getInvoiceContactForAdmin,
  getInvoiceContactsForAdmin,
  updateInvoiceContactForAdmin,
} from "../services/invoice-contact.service.js";

import { sendSuccess } from "../utils/api-response.js";

import {
  createInvoiceContactSchema,
  invoiceContactIdParamSchema,
  invoiceContactsQuerySchema,
  updateInvoiceContactSchema,
} from "../validators/invoice-contact.validator.js";

/* =========================================================
   LIST / SEARCH CONTACTS
   ========================================================= */

export const getAdminInvoiceContacts = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = invoiceContactsQuerySchema.parse(
      request.query,
    );

    const result = await getInvoiceContactsForAdmin(query);

    sendSuccess(
      response,
      200,
      result,
      "Invoice contacts retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

/* =========================================================
   GET CONTACT BY ID
   ========================================================= */

export const getAdminInvoiceContact = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = invoiceContactIdParamSchema.parse(
      request.params,
    );

    const contact = await getInvoiceContactForAdmin(id);

    sendSuccess(
      response,
      200,
      { contact },
      "Invoice contact retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

/* =========================================================
   CREATE CONTACT
   ========================================================= */

export const createAdminInvoiceContact = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const input = createInvoiceContactSchema.parse(
      request.body,
    );

    const contact = await createInvoiceContactForAdmin(
      input,
    );

    sendSuccess(
      response,
      201,
      { contact },
      "Invoice contact created successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

/* =========================================================
   UPDATE CONTACT
   ========================================================= */

export const updateAdminInvoiceContact = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = invoiceContactIdParamSchema.parse(
      request.params,
    );

    const input = updateInvoiceContactSchema.parse(
      request.body,
    );

    const contact = await updateInvoiceContactForAdmin(
      id,
      input,
    );

    sendSuccess(
      response,
      200,
      { contact },
      "Invoice contact updated successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

/* =========================================================
   DELETE CONTACT
   ========================================================= */

export const deleteAdminInvoiceContact = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = invoiceContactIdParamSchema.parse(
      request.params,
    );

    await deleteInvoiceContactForAdmin(id);

    sendSuccess(
      response,
      200,
      { deleted: true },
      "Invoice contact deleted successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};