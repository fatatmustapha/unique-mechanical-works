import { Router } from "express";

import {
  createAdminArchivedInvoice,
  getAdminArchivedInvoice,
  getAdminArchivedInvoices,
  downloadAdminArchivedInvoiceFile,
  updateAdminArchivedInvoice,
  deleteAdminArchivedInvoice,
} from "../controllers/invoice-archive.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";

import { uploadInvoiceFiles } from "../middleware/invoice-upload.middleware.js";

const invoiceArchiveRouter = Router();

/* =========================================================
   ADMIN AUTHENTICATION
   ========================================================= */

// Every route below requires administrator access.
invoiceArchiveRouter.use(authenticate, requireAdmin);

/* =========================================================
   SEARCH AND LIST ARCHIVED INVOICES
   ========================================================= */

invoiceArchiveRouter.get("/", getAdminArchivedInvoices);

/* =========================================================
   CREATE ARCHIVED INVOICE
   ========================================================= */

// Accepts invoice information and up to 10 attachments.
invoiceArchiveRouter.post("/", uploadInvoiceFiles, createAdminArchivedInvoice);

/* =========================================================
   GET ARCHIVED INVOICE
   ========================================================= */

invoiceArchiveRouter.get("/:id", getAdminArchivedInvoice);

invoiceArchiveRouter.put("/:id", updateAdminArchivedInvoice);

/* =========================================================
   DELETE ARCHIVED INVOICE
   ========================================================= */

invoiceArchiveRouter.delete("/:id", deleteAdminArchivedInvoice);

/* =========================================================
   DOWNLOAD PRIVATE INVOICE ATTACHMENT
   ========================================================= */

invoiceArchiveRouter.get(
  "/:id/files/:fileId/download",
  downloadAdminArchivedInvoiceFile,
);

export default invoiceArchiveRouter;
