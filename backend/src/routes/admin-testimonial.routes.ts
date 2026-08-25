import { Router } from "express";

import {
  deleteAdminTestimonial,
  getAdminTestimonials,
  reviewAdminTestimonial,
} from "../controllers/testimonial.controller.js";
import {
  authenticate,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const adminTestimonialRouter =
  Router();

adminTestimonialRouter.get(
  "/",
  authenticate,
  requireAdmin,
  getAdminTestimonials,
);

adminTestimonialRouter.patch(
  "/:id/review",
  authenticate,
  requireAdmin,
  reviewAdminTestimonial,
);

adminTestimonialRouter.delete(
  "/:id",
  authenticate,
  requireAdmin,
  deleteAdminTestimonial,
);

export default adminTestimonialRouter;