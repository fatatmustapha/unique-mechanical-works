import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  createArchivedInvoiceForAdmin,
  getArchivedInvoiceForAdmin,
  getArchivedInvoicesForAdmin,
  updateArchivedInvoiceForAdmin,
  deleteArchivedInvoiceForAdmin,
} from "../services/invoice-archive.service.js";

import { sendSuccess } from "../utils/api-response.js";

import {
  createInvoiceArchiveSchema,
  invoiceArchiveIdParamSchema,
  invoiceArchiveQuerySchema,
  updateInvoiceArchiveSchema,
} from "../validators/invoice-archive.validator.js";

import { cleanupInvoiceFiles } from "../utils/invoice-file.util.js";

import path from "node:path";

import {
  getArchivedInvoiceFileForAdmin,
} from "../services/invoice-archive.service.js";

import {
  invoiceArchiveFileIdParamSchema,
} from "../validators/invoice-archive.validator.js";

/* =========================================================
   CREATE ARCHIVED INVOICE
   ========================================================= */

export const createAdminArchivedInvoice = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  const files = Array.isArray(request.files)
    ? request.files
    : [];

  try {
    // Validate invoice information.
    const input = createInvoiceArchiveSchema.parse(
      request.body,
    );

    // The service validates and saves uploaded documents.
    const invoice = await createArchivedInvoiceForAdmin(
      input,
      files,
    );

    sendSuccess(
      response,
      201,
      { invoice },
      "Invoice archived successfully.",
    );
  } catch (error: unknown) {
    // The service handles cleanup when it is called.
    // This also handles errors occurring before the service,
    // such as invalid form fields.
    try {
      await cleanupInvoiceFiles(files);
    } catch (cleanupError: unknown) {
      console.error(
        "Invoice controller cleanup failed:",
        cleanupError,
      );
    }

    next(error);
  }
};

/* =========================================================
   GET ARCHIVED INVOICE BY ID
   ========================================================= */

export const getAdminArchivedInvoice = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = invoiceArchiveIdParamSchema.parse(
      request.params,
    );

    const invoice = await getArchivedInvoiceForAdmin(id);

    sendSuccess(
      response,
      200,
      { invoice },
      "Archived invoice retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

/* =========================================================
   DOWNLOAD PRIVATE INVOICE ATTACHMENT
   ========================================================= */

export const downloadAdminArchivedInvoiceFile = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = invoiceArchiveIdParamSchema.parse(
      request.params,
    );

    const { fileId } = invoiceArchiveFileIdParamSchema.parse(
      request.params,
    );

    const { file, filePath } =
      await getArchivedInvoiceFileForAdmin(id, fileId);

    // Prevent browsers from caching sensitive documents.
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");

    // Force a download rather than rendering untrusted
    // documents directly inside the browser.
    response.download(
      filePath,
      path.basename(file.original_name),
      (error) => {
        if (error && !response.headersSent) {
          next(error);
        }
      },
    );
  } catch (error: unknown) {
    next(error);
  }
};

/* =========================================================
   SEARCH AND LIST ARCHIVED INVOICES
   ========================================================= */

export const getAdminArchivedInvoices = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Validate search filters and pagination.
    const filters = invoiceArchiveQuerySchema.parse(
      request.query,
    );

    // Retrieve matching archived invoices.
    const result = await getArchivedInvoicesForAdmin(
      filters,
    );

    sendSuccess(
      response,
      200,
      result,
      "Archived invoices retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

/* =========================================================
   UPDATE ARCHIVED INVOICE
   ========================================================= */

export const updateAdminArchivedInvoice = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Validate the invoice ID.
    const { id } = invoiceArchiveIdParamSchema.parse(
      request.params,
    );

    // Validate the information being updated.
    const input = updateInvoiceArchiveSchema.parse(
      request.body,
    );

    // Update the archived invoice.
    const invoice = await updateArchivedInvoiceForAdmin(
      id,
      input,
    );

    sendSuccess(
      response,
      200,
      { invoice },
      "Archived invoice updated successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

/* =========================================================
   DELETE ARCHIVED INVOICE
   ========================================================= */

export const deleteAdminArchivedInvoice = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Validate the invoice ID.
    const { id } = invoiceArchiveIdParamSchema.parse(
      request.params,
    );

    // Delete the invoice and its attachments.
    await deleteArchivedInvoiceForAdmin(id);

    sendSuccess(
      response,
      200,
      { deleted: true },
      "Archived invoice deleted successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};