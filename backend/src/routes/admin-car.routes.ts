import { Router } from "express";

import {
  createAdminCar,
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

export default adminCarRouter;