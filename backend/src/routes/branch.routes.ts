import { Router } from "express";

import {
  getBranch,
  getBranches,
} from "../controllers/branch.controller.js";

const branchRouter = Router();

branchRouter.get("/", getBranches);
branchRouter.get("/:id", getBranch);

export default branchRouter;