import { Router } from "express";
import { createAppointment, getMyAppointments, getAllAppointments, updateAppointmentStatus } from "../controllers/appointments.controller";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth, createAppointment);
router.get("/mine", requireAuth, getMyAppointments);
router.get("/", requireAuth, requireAdmin, getAllAppointments);
router.put("/:id/status", requireAuth, requireAdmin, updateAppointmentStatus);

export default router;