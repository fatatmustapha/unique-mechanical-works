import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { env } from "./config/env.js";
import healthRouter from "./routes/health.routes.js";

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
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/health", healthRouter);

app.use(
  (
    error: unknown,
    _request: Request,
    response: Response,
    _next: NextFunction,
  ): void => {
    if (env.NODE_ENV === "development") {
      console.error(error);
    }

    response.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected server error occurred.",
        details: [],
      },
    });
  },
);

export default app;