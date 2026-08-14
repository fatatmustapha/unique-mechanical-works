import { Router } from "express";

import {
  createServiceController,
  getService,
  getServices,
  patchServiceStatus,
  updateServiceController,
} from "../controllers/service.controller.js";
import {
  authenticate,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const serviceRouter = Router();

serviceRouter.get("/", getServices);
serviceRouter.get("/:id", getService);

serviceRouter.post(
  "/",
  authenticate,
  requireAdmin,
  createServiceController,
);

serviceRouter.put(
  "/:id",
  authenticate,
  requireAdmin,
  updateServiceController,
);

serviceRouter.patch(
  "/:id/status",
  authenticate,
  requireAdmin,
  patchServiceStatus,
);

export default serviceRouter;