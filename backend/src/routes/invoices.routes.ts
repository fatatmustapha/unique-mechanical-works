import { Router } from "express";
import { getMyInvoices, getAllInvoices, createInvoice, updateInvoiceStatus } from "../controllers/invoices.controller";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/mine", requireAuth, getMyInvoices);
router.get("/", requireAuth, requireAdmin, getAllInvoices);
router.post("/", requireAuth, requireAdmin, createInvoice);
router.put("/:id/status", requireAuth, requireAdmin, updateInvoiceStatus);

export default router;