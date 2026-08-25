import { Router } from "express";

import {
  getMine,
  getMineById,
} from "../controllers/invoice.controller.js";
import {
  authenticate,
  requireCustomer,
} from "../middleware/auth.middleware.js";

const invoiceRouter = Router();

invoiceRouter.get(
  "/mine",
  authenticate,
  requireCustomer,
  getMine,
);

invoiceRouter.get(
  "/mine/:id",
  authenticate,
  requireCustomer,
  getMineById,
);

export default invoiceRouter;