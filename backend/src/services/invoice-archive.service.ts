import { AppError } from "../errors/app-error.js";

import {
  archivedInvoiceContactExists,
  archivedInvoiceCustomerExists,
  createArchivedInvoice,
  findArchivedInvoiceById,
  findArchivedInvoiceFiles,
  findArchivedInvoices,
  deleteArchivedInvoice,
  type ArchivedInvoice,
  type ArchivedInvoiceFile,
  type NewArchivedInvoiceFile,
} from "../repositories/invoice-archive.repository.js";

import {
  cleanupInvoiceFiles,
  validateInvoiceFile,
  deleteInvoiceFile,
} from "../utils/invoice-file.util.js";

import fs from "node:fs/promises";

import {
  findArchivedInvoiceFileById,
  updateArchivedInvoice,
} from "../repositories/invoice-archive.repository.js";

import {
  getInvoiceFilePath,
} from "../utils/invoice-file.util.js";

import type {
  CreateInvoiceArchiveInput,
  InvoiceArchiveQuery,
  UpdateInvoiceArchiveInput,
} from "../validators/invoice-archive.validator.js";

/* =========================================================
   TYPES
   ========================================================= */

export interface ArchivedInvoiceDetails
  extends ArchivedInvoice {
  files: ArchivedInvoiceFile[];
}

/* =========================================================
   GET ARCHIVED INVOICE
   ========================================================= */

export const getArchivedInvoiceForAdmin = async (
  archiveId: number,
): Promise<ArchivedInvoiceDetails> => {
  const invoice = await findArchivedInvoiceById(
    archiveId,
  );

  if (!invoice) {
    throw new AppError({
      statusCode: 404,
      code: "ARCHIVED_INVOICE_NOT_FOUND",
      message: "Archived invoice not found.",
    });
  }

  const files = await findArchivedInvoiceFiles(
    archiveId,
  );

  return {
    ...invoice,
    files,
  };
};

/* =========================================================
   VERIFY INVOICE OWNER
   ========================================================= */

const verifyInvoiceOwner = async (
  input: CreateInvoiceArchiveInput,
): Promise<void> => {
  if (input.customer_id != null) {
    const exists = await archivedInvoiceCustomerExists(
      input.customer_id,
    );

    if (!exists) {
      throw new AppError({
        statusCode: 404,
        code: "INVOICE_CUSTOMER_NOT_FOUND",
        message: "The selected customer does not exist.",
      });
    }

    return;
  }

  if (input.contact_id != null) {
    const exists = await archivedInvoiceContactExists(
      input.contact_id,
    );

    if (!exists) {
      throw new AppError({
        statusCode: 404,
        code: "INVOICE_CONTACT_NOT_FOUND",
        message:
          "The selected supplier or walk-in customer does not exist.",
      });
    }

    return;
  }

  throw new AppError({
    statusCode: 400,
    code: "INVOICE_OWNER_REQUIRED",
    message:
      "Select a registered customer, supplier, or walk-in customer.",
  });
};

/* =========================================================
   CREATE ARCHIVED INVOICE
   ========================================================= */

export const createArchivedInvoiceForAdmin = async (
  input: CreateInvoiceArchiveInput,
  files: Express.Multer.File[],
): Promise<ArchivedInvoiceDetails> => {
  try {
    // Every archived invoice needs at least one document.
    if (files.length === 0) {
      throw new AppError({
        statusCode: 400,
        code: "INVOICE_FILE_REQUIRED",
        message:
          "Upload at least one invoice photograph or PDF.",
      });
    }

    // Verify that the selected owner exists.
    await verifyInvoiceOwner(input);

    // Validate each uploaded document.
    const fileRecords: NewArchivedInvoiceFile[] = [];

    for (const file of files) {
      const detectedMimeType = await validateInvoiceFile(
        file,
      );

      fileRecords.push({
        original_name: file.originalname,
        stored_name: file.filename,
        mime_type: detectedMimeType,
        file_size: file.size,
      });
    }

    // Save invoice and file metadata in MySQL.
    const invoice = await createArchivedInvoice(
      input,
      fileRecords,
    );

    const attachments = await findArchivedInvoiceFiles(
      invoice.archive_id,
    );

    return {
      ...invoice,
      files: attachments,
    };
  } catch (error: unknown) {
    // Remove uploaded files if validation or database saving fails.
    try {
      await cleanupInvoiceFiles(files);
    } catch (cleanupError: unknown) {
      console.error(
        "Invoice upload cleanup failed:",
        cleanupError,
      );
    }

    throw error;
  }
};

/* =========================================================
   GET PRIVATE INVOICE ATTACHMENT
   ========================================================= */

export const getArchivedInvoiceFileForAdmin = async (
  archiveId: number,
  fileId: number,
) => {
  // Confirm that the invoice exists.
  await getArchivedInvoiceForAdmin(archiveId);

  // Find the requested attachment.
  const file = await findArchivedInvoiceFileById(fileId);

  // Prevent accessing an attachment belonging to another invoice.
  if (!file || file.archive_id !== archiveId) {
    throw new AppError({
      statusCode: 404,
      code: "INVOICE_FILE_NOT_FOUND",
      message: "Invoice attachment not found.",
    });
  }

  const filePath = getInvoiceFilePath(file.stored_name);

  // Confirm that the private file still exists.
  try {
    await fs.access(filePath);
  } catch {
    throw new AppError({
      statusCode: 404,
      code: "INVOICE_FILE_MISSING",
      message: "The invoice attachment is missing from storage.",
    });
  }

  return {
    file,
    filePath,
  };
};

/* =========================================================
   SEARCH ARCHIVED INVOICES
   ========================================================= */

export const getArchivedInvoicesForAdmin = async (
  filters: InvoiceArchiveQuery,
) => {
  return findArchivedInvoices(filters);
};

/* =========================================================
   UPDATE ARCHIVED INVOICE
   ========================================================= */

export const updateArchivedInvoiceForAdmin = async (
  archiveId: number,
  input: UpdateInvoiceArchiveInput,
): Promise<ArchivedInvoiceDetails> => {
  // Confirm that the invoice exists.
  await getArchivedInvoiceForAdmin(archiveId);

  // Update the invoice information.
  await updateArchivedInvoice(archiveId, input);

  // Return the updated invoice with its attachments.
  return getArchivedInvoiceForAdmin(archiveId);
};

/* =========================================================
   DELETE ARCHIVED INVOICE AND ATTACHMENTS
   ========================================================= */

export const deleteArchivedInvoiceForAdmin = async (
  archiveId: number,
): Promise<void> => {
  // Confirm the invoice exists and retrieve its attachments.
  const invoice = await getArchivedInvoiceForAdmin(archiveId);

  // Delete the invoice from MySQL.
  // Related attachment records are deleted automatically
  // through ON DELETE CASCADE.
  const deleted = await deleteArchivedInvoice(archiveId);

  if (!deleted) {
    throw new AppError({
      statusCode: 404,
      code: "ARCHIVED_INVOICE_NOT_FOUND",
      message: "Archived invoice not found.",
    });
  }

  // Remove the physical files from private storage.
  for (const file of invoice.files) {
    try {
      await deleteInvoiceFile(file.stored_name);
    } catch (error: unknown) {
      console.error(
        `Failed to remove invoice attachment ${file.file_id}:`,
        error,
      );
    }
  }
};