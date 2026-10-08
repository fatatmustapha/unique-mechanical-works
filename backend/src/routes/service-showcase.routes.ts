import { Router } from "express";

import {
  createAdminShowcase,
  deleteAdminShowcase,
  deleteAdminShowcaseImage,
  getAdminShowcase,
  getAdminShowcases,
  getPublicShowcases,
  patchAdminShowcaseStatus,
  updateAdminShowcase,
} from "../controllers/service-showcase.controller.js";

import {
  authenticate,
  requireAdmin,
} from "../middleware/auth.middleware.js";

import { serviceShowcaseImageUpload } from "../utils/upload.js";

const router = Router();

router.get("/", getPublicShowcases);

router.get(
  "/admin",
  authenticate,
  requireAdmin,
  getAdminShowcases,
);

router.get(
  "/admin/:id",
  authenticate,
  requireAdmin,
  getAdminShowcase,
);

router.post(
  "/admin",
  authenticate,
  requireAdmin,
  serviceShowcaseImageUpload.fields([
    {
      name: "before_images",
      maxCount: 6,
    },
    {
      name: "after_images",
      maxCount: 6,
    },
  ]),
  createAdminShowcase,
);

router.put(
  "/admin/:id",
  authenticate,
  requireAdmin,
  serviceShowcaseImageUpload.fields([
    {
      name: "before_images",
      maxCount: 6,
    },
    {
      name: "after_images",
      maxCount: 6,
    },
  ]),
  updateAdminShowcase,
);

router.patch(
  "/admin/:id/status",
  authenticate,
  requireAdmin,
  patchAdminShowcaseStatus,
);

router.delete(
  "/admin/:id/images/:imageId",
  authenticate,
  requireAdmin,
  deleteAdminShowcaseImage,
);

router.delete(
  "/admin/:id",
  authenticate,
  requireAdmin,
  deleteAdminShowcase,
);

export default router;