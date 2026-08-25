import { Router } from "express";

import { getDashboardSummary } from "../controllers/dashboard.controller.js";
import {
  authenticate,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const adminDashboardRouter = Router();

adminDashboardRouter.get(
  "/summary",
  authenticate,
  requireAdmin,
  getDashboardSummary,
);

export default adminDashboardRouter;