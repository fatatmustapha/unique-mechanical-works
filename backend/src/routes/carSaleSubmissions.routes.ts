import { Router } from "express";
import { createSubmission, getSubmissions, reviewSubmission } from "../controllers/carSaleSubmissions.controller";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth, createSubmission);
router.get("/", requireAuth, requireAdmin, getSubmissions);
router.put("/:id", requireAuth, requireAdmin, reviewSubmission);

export default router;