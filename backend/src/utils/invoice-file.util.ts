import { open, unlink } from "node:fs/promises";
import path from "node:path";

import { AppError } from "../errors/app-error.js";

import { invoiceStorageDirectory } from "../middleware/invoice-upload.middleware.js";

/* =========================================================
   FILE SIGNATURES
   ========================================================= */

const matchesSignature = (
  buffer: Buffer,
  signature: number[],
  offset = 0,
): boolean => {
  return signature.every(
    (byte, index) => buffer[offset + index] === byte,
  );
};

/* =========================================================
   DETECT ACTUAL FILE TYPE
   ========================================================= */

const detectFileType = (
  buffer: Buffer,
): string | null => {
  // PDF: %PDF-
  if (
    matchesSignature(buffer, [
      0x25, 0x50, 0x44, 0x46, 0x2d,
    ])
  ) {
    return "application/pdf";
  }

  // JPEG
  if (
    matchesSignature(buffer, [
      0xff, 0xd8, 0xff,
    ])
  ) {
    return "image/jpeg";
  }

  // PNG
  if (
    matchesSignature(buffer, [
      0x89, 0x50, 0x4e, 0x47,
      0x0d, 0x0a, 0x1a, 0x0a,
    ])
  ) {
    return "image/png";
  }

  // WebP: RIFF....WEBP
  if (
    matchesSignature(buffer, [
      0x52, 0x49, 0x46, 0x46,
    ]) &&
    matchesSignature(
      buffer,
      [0x57, 0x45, 0x42, 0x50],
      8,
    )
  ) {
    return "image/webp";
  }

  return null;
};

/* =========================================================
   VALIDATE UPLOADED FILE
   ========================================================= */

export const validateInvoiceFile = async (
  file: Express.Multer.File,
): Promise<string> => {
  const handle = await open(file.path, "r");

  let bytesRead = 0;
  const buffer = Buffer.alloc(16);

  try {
    const result = await handle.read(
      buffer,
      0,
      buffer.length,
      0,
    );

    bytesRead = result.bytesRead;
  } finally {
    await handle.close();
  }

  const detectedType = detectFileType(
    buffer.subarray(0, bytesRead),
  );

  if (
    !detectedType ||
    detectedType !== file.mimetype
  ) {
    throw new AppError({
      statusCode: 400,
      code: "INVALID_INVOICE_FILE",
      message:
        "The uploaded file is not a valid PDF, JPG, PNG, or WebP document.",
    });
  }

  return detectedType;
};

/* =========================================================
   GET SAFE PRIVATE FILE PATH
   ========================================================= */

export const getInvoiceFilePath = (
  storedName: string,
): string => {
  // Stored names must be simple filenames, not paths.
  if (
    !storedName ||
    storedName === "." ||
    storedName === ".." ||
    path.basename(storedName) !== storedName ||
    storedName.includes("/") ||
    storedName.includes("\\")
  ) {
    throw new AppError({
      statusCode: 400,
      code: "INVALID_INVOICE_FILE_PATH",
      message: "Invalid invoice file path.",
    });
  }

  return path.join(
    invoiceStorageDirectory,
    storedName,
  );
};

/* =========================================================
   DELETE ONE PRIVATE FILE
   ========================================================= */

export const deleteInvoiceFile = async (
  storedName: string,
): Promise<void> => {
  const filePath = getInvoiceFilePath(storedName);

  try {
    await unlink(filePath);
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return;
    }

    throw error;
  }
};

/* =========================================================
   CLEAN UP MULTIPLE UPLOADED FILES
   ========================================================= */

export const cleanupInvoiceFiles = async (
  files: Express.Multer.File[],
): Promise<void> => {
  const results = await Promise.allSettled(
    files.map((file) =>
      deleteInvoiceFile(file.filename),
    ),
  );

  const failures = results.filter(
    (result) => result.status === "rejected",
  );

  if (failures.length > 0) {
    throw new Error(
      `Failed to clean up ${failures.length} invoice file(s).`,
    );
  }
};