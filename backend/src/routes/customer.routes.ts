import { Router } from "express";

import {
  getCustomer,
  getCustomers,
  getMyProfile,
  patchCustomerStatus,
  updateMyProfile,
} from "../controllers/customer.controller.js";
import {
  authenticate,
  requireAdmin,
  requireCustomer,
} from "../middleware/auth.middleware.js";

const customerRouter = Router();

customerRouter.get(
  "/me",
  authenticate,
  requireCustomer,
  getMyProfile,
);

customerRouter.put(
  "/me",
  authenticate,
  requireCustomer,
  updateMyProfile,
);

customerRouter.get(
  "/",
  authenticate,
  requireAdmin,
  getCustomers,
);

customerRouter.get(
  "/:id",
  authenticate,
  requireAdmin,
  getCustomer,
);

customerRouter.patch(
  "/:id/status",
  authenticate,
  requireAdmin,
  patchCustomerStatus,
);

export default customerRouter;