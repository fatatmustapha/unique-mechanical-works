import { Router } from "express";
import { registerCustomer, loginCustomer, loginAdmin, getCurrentUser } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/register", registerCustomer);     // create a customer account
router.post("/login", loginCustomer);            // customer login
router.post("/admin/login", loginAdmin);         // admin login, kept separate on purpose
router.get("/me", requireAuth, getCurrentUser);  // who am I logged in as?

export default router;