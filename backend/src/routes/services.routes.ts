import { Router } from "express";
import { getServices, getServiceById, createService, updateService, deleteService } from "../controllers/services.controller";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/", getServices);
router.get("/:id", getServiceById);
router.post("/", requireAuth, requireAdmin, createService);
router.put("/:id", requireAuth, requireAdmin, updateService);
router.delete("/:id", requireAuth, requireAdmin, deleteService);

export default router;