import { Router } from "express";
import { getApprovedTestimonials, createTestimonial, getAllTestimonials, approveTestimonial, deleteTestimonial } from "../controllers/testimonials.controller";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/", getApprovedTestimonials);
router.post("/", requireAuth, createTestimonial);
router.get("/admin", requireAuth, requireAdmin, getAllTestimonials);
router.put("/:id/approve", requireAuth, requireAdmin, approveTestimonial);
router.delete("/:id", requireAuth, requireAdmin, deleteTestimonial);

export default router;