import { Router } from "express";

import {
  adminLogin,
  login,
  logout,
  me,
  refresh,
  register,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/admin/login", adminLogin);

authRouter.get("/me", authenticate, me);

authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);

export default authRouter;