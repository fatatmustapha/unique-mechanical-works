import { Router } from "express";

import {
  getApprovedTestimonials,
  getMine,
  submitTestimonial,
} from "../controllers/testimonial.controller.js";
import {
  authenticate,
  requireCustomer,
} from "../middleware/auth.middleware.js";

const testimonialRouter =
  Router();

testimonialRouter.get(
  "/",
  getApprovedTestimonials,
);

testimonialRouter.post(
  "/",
  authenticate,
  requireCustomer,
  submitTestimonial,
);

testimonialRouter.get(
  "/mine",
  authenticate,
  requireCustomer,
  getMine,
);

export default testimonialRouter;