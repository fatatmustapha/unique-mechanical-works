import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import type {
  Request,
  Response,
  NextFunction,
} from "express";
import { AppError } from "../errors/app-error.js";

/* =========================================================
   PRIVATE STORAGE
   ========================================================= */

export const invoiceStorageDirectory = path.resolve(
  process.cwd(),
  "private-storage",
  "invoices",
);

fs.mkdirSync(invoiceStorageDirectory, {
  recursive: true,
});

/* =========================================================
   ALLOWED FILE TYPES
   ========================================================= */

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

/* =========================================================
   FILE STORAGE
   ========================================================= */

const storage = multer.diskStorage({
  destination: (
    _request,
    _file,
    callback,
  ) => {
    callback(null, invoiceStorageDirectory);
  },

  filename: (
    _request,
    file,
    callback,
  ) => {
    const extension = path.extname(
      file.originalname,
    ).toLowerCase();

    const filename = `${crypto.randomUUID()}${extension}`;

    callback(null, filename);
  },
});

/* =========================================================
   FILE VALIDATION
   ========================================================= */

const fileFilter: multer.Options["fileFilter"] = (
  _request,
  file,
  callback,
) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    callback(
      new AppError({
        statusCode: 400,
        code: "INVALID_INVOICE_FILE_TYPE",
        message:
          "Only PDF, JPG, PNG, and WebP invoice files are allowed.",
      }),
    );

    return;
  }

  callback(null, true);
};

/* =========================================================
   UPLOAD CONFIGURATION
   ========================================================= */

export const invoiceUpload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024,

    files: 10,

    fields: 20,

    parts: 30,
  },
});

/* =========================================================
   MULTIPLE INVOICE ATTACHMENTS
   ========================================================= */

/* =========================================================
   MULTIPLE INVOICE ATTACHMENTS
   WITH ERROR HANDLING
   ========================================================= */

export const uploadInvoiceFiles = (
  request: Request,
  response: Response,
  next: NextFunction,
): void => {
  const upload = invoiceUpload.array("files", 10);

  upload(request, response, async (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    // Multer normally removes files it has already written
    // when an upload fails. This is an additional cleanup
    // attempt for files still exposed through request.files.
    const files = Array.isArray(request.files)
      ? request.files
      : [];

    if (files.length > 0) {
      const { cleanupInvoiceFiles } = await import(
        "../utils/invoice-file.util.js"
      );

      try {
        await cleanupInvoiceFiles(files);
      } catch (cleanupError: unknown) {
        console.error(
          "Failed to clean up interrupted invoice upload:",
          cleanupError,
        );
      }
    }

    if (error instanceof multer.MulterError) {
      next(
        new AppError({
          statusCode: 400,
          code: "INVOICE_UPLOAD_ERROR",
          message:
            error.code === "LIMIT_FILE_SIZE"
              ? "Each invoice file must be 10 MB or smaller."
              : error.code === "LIMIT_FILE_COUNT" ||
                  error.code === "LIMIT_UNEXPECTED_FILE"
                ? "You can upload a maximum of 10 invoice files."
                : "The invoice upload could not be completed.",
        }),
      );

      return;
    }

    next(error);
  });
};