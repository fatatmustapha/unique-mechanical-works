import { Router } from "express";

import {
  getApplicationHealth,
  getDatabaseHealth,
} from "../controllers/health.controller.js";

const healthRouter = Router();

healthRouter.get("/", getApplicationHealth);
healthRouter.get("/database", getDatabaseHealth);

export default healthRouter;