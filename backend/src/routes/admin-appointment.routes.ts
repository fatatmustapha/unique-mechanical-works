import { Router } from "express";

import {
  getAdminAppointment,
  getAdminAppointments,
  updateAdminAppointment,
  updateAdminAppointmentStatus,
} from "../controllers/appointment.controller.js";
import {
  authenticate,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const adminAppointmentRouter = Router();

adminAppointmentRouter.get(
  "/",
  authenticate,
  requireAdmin,
  getAdminAppointments,
);

adminAppointmentRouter.get(
  "/:id",
  authenticate,
  requireAdmin,
  getAdminAppointment,
);

adminAppointmentRouter.put(
  "/:id",
  authenticate,
  requireAdmin,
  updateAdminAppointment,
);

adminAppointmentRouter.patch(
  "/:id/status",
  authenticate,
  requireAdmin,
  updateAdminAppointmentStatus,
);

export default adminAppointmentRouter;