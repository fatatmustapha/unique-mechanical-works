import { Router } from "express";

import {
  adminLogin,
  login,
  register,
} from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/admin/login", adminLogin);

export default authRouter;