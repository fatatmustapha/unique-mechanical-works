import express, { type Express, type Request, type Response } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

const app: Express = express();

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/api/health", (_request: Request, response: Response) => {
  response.status(200).json({
    success: true,
    message: "Unique Mechanical Works API is running.",
    data: {
      status: "healthy",
    },
  });
});

export default app;