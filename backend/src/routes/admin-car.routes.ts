import { Router } from "express";

import {
  createAdminCar,
  deleteCarController,
  updateAdminCar,
  updateCarFeaturedController,
  updateCarPublicationController,
  updateCarStatusController,
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
  "/:id/status",
  authenticate,
  requireAdmin,
  updateCarStatusController,
);

adminCarRouter.patch(
  "/:id/publication",
  authenticate,
  requireAdmin,
  updateCarPublicationController,
);

adminCarRouter.patch(
  "/:id/featured",
  authenticate,
  requireAdmin,
  updateCarFeaturedController,
);

adminCarRouter.delete(
  "/:id",
  authenticate,
  requireAdmin,
  deleteCarController,
);

export default adminCarRouter;