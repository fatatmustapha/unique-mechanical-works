import { Router } from "express";

import {
  getCar,
  getCars,
} from "../controllers/car.controller.js";

const carRouter = Router();

carRouter.get("/", getCars);
carRouter.get("/:slug", getCar);

export default carRouter;