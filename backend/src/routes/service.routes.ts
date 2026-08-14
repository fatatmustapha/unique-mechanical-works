import { Router } from "express";

import {
  getService,
  getServices,
} from "../controllers/service.controller.js";

const serviceRouter = Router();

serviceRouter.get("/", getServices);
serviceRouter.get("/:id", getService);

export default serviceRouter;