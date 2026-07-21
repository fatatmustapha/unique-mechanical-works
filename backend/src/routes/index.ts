import { Router } from "express";
import authRoutes from "./auth.routes";
import customersRoutes from "./customers.routes";
import branchesRoutes from "./branches.routes";
import carsRoutes from "./cars.routes";
import carSaleSubmissionsRoutes from "./carSaleSubmissions.routes";
import servicesRoutes from "./services.routes";
import appointmentsRoutes from "./appointments.routes";
import invoicesRoutes from "./invoices.routes";
import testimonialsRoutes from "./testimonials.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/customers", customersRoutes);
router.use("/branches", branchesRoutes);
router.use("/cars", carsRoutes);
router.use("/car-sale-submissions", carSaleSubmissionsRoutes);
router.use("/services", servicesRoutes);
router.use("/appointments", appointmentsRoutes);
router.use("/invoices", invoicesRoutes);
router.use("/testimonials", testimonialsRoutes);

export default router;