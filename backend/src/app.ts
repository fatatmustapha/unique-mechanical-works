import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";
import authRouter from "./routes/auth.routes.js";
import customerRouter from "./routes/customer.routes.js";
import branchRouter from "./routes/branch.routes.js";
import healthRouter from "./routes/health.routes.js";
import serviceRouter from "./routes/service.routes.js";
import carRouter from "./routes/car.routes.js";

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

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Application routes
app.use("/api/auth", authRouter);
app.use("/api/customers", customerRouter);
app.use("/api/branches", branchRouter);
app.use("/api/services", serviceRouter);
app.use("/api/cars", carRouter);
app.use("/api/health", healthRouter);

// These must remain after all valid routes.
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;