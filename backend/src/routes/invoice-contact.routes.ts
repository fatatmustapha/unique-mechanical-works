import { Router } from "express";

import {
  createAdminInvoiceContact,
  deleteAdminInvoiceContact,
  getAdminInvoiceContact,
  getAdminInvoiceContacts,
  updateAdminInvoiceContact,
} from "../controllers/invoice-contact.controller.js";

import {
  authenticate,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const invoiceContactRouter = Router();

/* =========================================================
   ADMIN AUTHENTICATION
   ========================================================= */

invoiceContactRouter.use(authenticate, requireAdmin);

/* =========================================================
   LIST / SEARCH CONTACTS
   ========================================================= */

invoiceContactRouter.get(
  "/",
  getAdminInvoiceContacts,
);

/* =========================================================
   GET CONTACT BY ID
   ========================================================= */

invoiceContactRouter.get(
  "/:id",
  getAdminInvoiceContact,
);

/* =========================================================
   CREATE CONTACT
   ========================================================= */

invoiceContactRouter.post(
  "/",
  createAdminInvoiceContact,
);

/* =========================================================
   UPDATE CONTACT
   ========================================================= */

invoiceContactRouter.put(
  "/:id",
  updateAdminInvoiceContact,
);

/* =========================================================
   DELETE CONTACT
   ========================================================= */

invoiceContactRouter.delete(
  "/:id",
  deleteAdminInvoiceContact,
);

export default invoiceContactRouter;