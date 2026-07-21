import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/db";
import apiRoutes from "./routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Database connection failed" });
  }
});

app.use("/api", apiRoutes);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong on our end." });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});