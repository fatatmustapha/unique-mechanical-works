import { Router } from "express";

import {
  archiveCarController,
  createAdminCar,
  deleteCarController,
  markCarAvailableController,
  markCarSoldController,
  publishCarController,
  toggleFeaturedCarController,
  updateAdminCar,
} from "../controllers/car.controller.js";
import {
  authenticate,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const adminCarRouter = Router();

adminCarRouter.post(
  "/",
  authenticate,
  requireAdmin,
  createAdminCar,
);

adminCarRouter.put(
  "/:id",
  authenticate,
  requireAdmin,
  updateAdminCar,
);

adminCarRouter.patch(
  "/:id/publish",
  authenticate,
  requireAdmin,
  publishCarController,
);

adminCarRouter.patch(
  "/:id/archive",
  authenticate,
  requireAdmin,
  archiveCarController,
);

adminCarRouter.patch(
  "/:id/featured",
  authenticate,
  requireAdmin,
  toggleFeaturedCarController,
);

adminCarRouter.patch(
  "/:id/sold",
  authenticate,
  requireAdmin,
  markCarSoldController,
);

adminCarRouter.patch(
  "/:id/available",
  authenticate,
  requireAdmin,
  markCarAvailableController,
);

adminCarRouter.delete(
  "/:id",
  authenticate,
  requireAdmin,
  deleteCarController,
);

export default adminCarRouter;