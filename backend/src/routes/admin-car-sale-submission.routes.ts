import { Router } from "express";

import {
  getAdminSubmission,
  getAdminSubmissions,
  reviewAdminSubmission,
} from "../controllers/car-sale-submission.controller.js";
import {
  authenticate,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const adminCarSaleSubmissionRouter =
  Router();

adminCarSaleSubmissionRouter.get(
  "/",
  authenticate,
  requireAdmin,
  getAdminSubmissions,
);

adminCarSaleSubmissionRouter.get(
  "/:id",
  authenticate,
  requireAdmin,
  getAdminSubmission,
);

adminCarSaleSubmissionRouter.patch(
  "/:id/review",
  authenticate,
  requireAdmin,
  reviewAdminSubmission,
);

export default adminCarSaleSubmissionRouter;