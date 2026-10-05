import { Router } from "express";

import {
  bookAppointment,
  cancelMine,
  rescheduleMine,
  getMine,
  getMineById,
  hideMine,
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

appointmentRouter.patch(
  "/mine/:id/hide",
  authenticate,
  requireCustomer,
  hideMine,
);

appointmentRouter.patch(
  "/mine/:id/reschedule",
  authenticate,
  requireCustomer,
  rescheduleMine,
);


export default appointmentRouter;