import { Router } from "express";

import {
  createSubmission,
  deleteMySubmission,
  getMySubmission,
  getMySubmissions,
  updateMySubmission,
} from "../controllers/car-sale-submission.controller.js";
import {
  authenticate,
  requireCustomer,
} from "../middleware/auth.middleware.js";

const carSaleSubmissionRouter =
  Router();

carSaleSubmissionRouter.post(
  "/",
  authenticate,
  requireCustomer,
  createSubmission,
);

carSaleSubmissionRouter.get(
  "/mine",
  authenticate,
  requireCustomer,
  getMySubmissions,
);

carSaleSubmissionRouter.get(
  "/mine/:id",
  authenticate,
  requireCustomer,
  getMySubmission,
);

carSaleSubmissionRouter.put(
  "/mine/:id",
  authenticate,
  requireCustomer,
  updateMySubmission,
);

carSaleSubmissionRouter.delete(
  "/mine/:id",
  authenticate,
  requireCustomer,
  deleteMySubmission,
);

export default carSaleSubmissionRouter;