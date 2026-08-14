import { Router } from "express";

import {
  createServiceBranch,
  createServiceController,
  deleteServiceBranch,
  getService,
  getServiceBranches,
  getServices,
  patchServiceStatus,
  updateServiceBranch,
  updateServiceController,
} from "../controllers/service.controller.js";
import {
  authenticate,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const serviceRouter = Router();

serviceRouter.get("/", getServices);

serviceRouter.get(
  "/:id/branches",
  getServiceBranches,
);

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

serviceRouter.post(
  "/:id/branches",
  authenticate,
  requireAdmin,
  createServiceBranch,
);

serviceRouter.put(
  "/:id/branches/:branchId",
  authenticate,
  requireAdmin,
  updateServiceBranch,
);

serviceRouter.delete(
  "/:id/branches/:branchId",
  authenticate,
  requireAdmin,
  deleteServiceBranch,
);

export default serviceRouter;