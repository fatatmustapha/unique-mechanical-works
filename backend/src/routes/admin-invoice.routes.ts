import { Router } from "express";

import {
  createAdminInvoice,
  getAdminInvoice,
  getAdminInvoices,
  recordAdminInvoicePayment,
  updateAdminInvoice,
} from "../controllers/invoice.controller.js";
import {
  authenticate,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const adminInvoiceRouter = Router();

adminInvoiceRouter.get(
  "/",
  authenticate,
  requireAdmin,
  getAdminInvoices,
);

adminInvoiceRouter.get(
  "/:id",
  authenticate,
  requireAdmin,
  getAdminInvoice,
);

adminInvoiceRouter.post(
  "/",
  authenticate,
  requireAdmin,
  createAdminInvoice,
);

adminInvoiceRouter.put(
  "/:id",
  authenticate,
  requireAdmin,
  updateAdminInvoice,
);

adminInvoiceRouter.patch(
  "/:id/payment",
  authenticate,
  requireAdmin,
  recordAdminInvoicePayment,
);

export default adminInvoiceRouter;