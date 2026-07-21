import { Router } from "express";
import { getMyProfile, updateMyProfile, getAllCustomers } from "../controllers/customers.controller";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/me", requireAuth, getMyProfile);
router.put("/me", requireAuth, updateMyProfile);
router.get("/", requireAuth, requireAdmin, getAllCustomers);

export default router;