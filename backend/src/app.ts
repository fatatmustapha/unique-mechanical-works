import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";

import { env } from "./config/env.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";
import authRouter from "./routes/auth.routes.js";
import customerRouter from "./routes/customer.routes.js";
import branchRouter from "./routes/branch.routes.js";
import healthRouter from "./routes/health.routes.js";
import serviceRouter from "./routes/service.routes.js";
import adminCarRouter from "./routes/admin-car.routes.js";
import carRouter from "./routes/car.routes.js";
import carImageRouter from "./routes/car-image.routes.js";
import carSaleSubmissionRouter from "./routes/car-sale-submission.routes.js";
import adminCarSaleSubmissionRouter from "./routes/admin-car-sale-submission.routes.js";
import appointmentRouter from "./routes/appointment.routes.js";
import adminAppointmentRouter from "./routes/admin-appointment.routes.js";
import invoiceRouter from "./routes/invoice.routes.js";
import adminInvoiceRouter from "./routes/admin-invoice.routes.js";
import favoriteRouter from "./routes/favorite.routes.js";
import adminDashboardRouter from "./routes/admin-dashboard.routes.js";
import testimonialRouter from "./routes/testimonial.routes.js";
import adminTestimonialRouter from "./routes/admin-testimonial.routes.js";

const app: Express = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  }),
);

app.use(cookieParser());

app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Application routes
app.use("/api/auth", authRouter);
app.use("/api/customers", customerRouter);
app.use("/api/branches", branchRouter);
app.use("/api/services", serviceRouter);
app.use("/api/cars", carRouter);
app.use("/api/admin/cars", adminCarRouter);
app.use("/api/cars/:id/images", carImageRouter);
app.use("/api/health", healthRouter);
app.use("/api/car-sale-submissions", carSaleSubmissionRouter);
app.use("/api/admin/car-sale-submissions", adminCarSaleSubmissionRouter);
app.use("/api/appointments", appointmentRouter);
app.use("/api/admin/appointments", adminAppointmentRouter);
app.use("/api/invoices", invoiceRouter);
app.use("/api/admin/invoices", adminInvoiceRouter);
app.use("/api/favorites", favoriteRouter);
app.use("/api/admin/dashboard", adminDashboardRouter);
app.use("/api/testimonials", testimonialRouter);
app.use("/api/admin/testimonials", adminTestimonialRouter);

// These must remain after all valid routes.
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
