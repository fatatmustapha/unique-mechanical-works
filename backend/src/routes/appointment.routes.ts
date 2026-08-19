import { Router } from "express";

import {
  bookAppointment,
  cancelMine,
  getMine,
  getMineById,
} from "../controllers/appointment.controller.js";
import {
  authenticate,
  requireCustomer,
} from "../middleware/auth.middleware.js";

const appointmentRouter = Router();

appointmentRouter.post(
  "/",
  authenticate,
  requireCustomer,
  bookAppointment,
);

appointmentRouter.get(
  "/mine",
  authenticate,
  requireCustomer,
  getMine,
);

appointmentRouter.get(
  "/mine/:id",
  authenticate,
  requireCustomer,
  getMineById,
);

appointmentRouter.patch(
  "/mine/:id/cancel",
  authenticate,
  requireCustomer,
  cancelMine,
);

export default appointmentRouter;