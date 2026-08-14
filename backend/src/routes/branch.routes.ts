import { Router } from "express";

import {
  createBranchController,
  getBranch,
  getBranches,
  patchBranchStatus,
  updateBranchController,
} from "../controllers/branch.controller.js";
import {
  authenticate,
  requireSuperAdmin,
} from "../middleware/auth.middleware.js";

const branchRouter = Router();

branchRouter.get("/", getBranches);
branchRouter.get("/:id", getBranch);

branchRouter.post(
  "/",
  authenticate,
  requireSuperAdmin,
  createBranchController,
);

branchRouter.put(
  "/:id",
  authenticate,
  requireSuperAdmin,
  updateBranchController,
);

branchRouter.patch(
  "/:id/status",
  authenticate,
  requireSuperAdmin,
  patchBranchStatus,
);

export default branchRouter;