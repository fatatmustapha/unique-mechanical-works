import { Router } from "express";

import {
  createImageForCar,
  deleteImageForCar,
  getImagesForCar,
  reorderImagesForCarController,
  setPrimaryImageForCar,
  updateImageForCar,
} from "../controllers/car-image.controller.js";
import {
  authenticate,
  requireAdmin,
} from "../middleware/auth.middleware.js";
import { carImageUpload } from "../utils/upload.js";

const carImageRouter = Router({
  mergeParams: true,
});

carImageRouter.get(
  "/",
  getImagesForCar,
);

carImageRouter.post(
  "/",
  authenticate,
  requireAdmin,
  carImageUpload.single("image"),
  createImageForCar,
);

carImageRouter.patch(
  "/reorder",
  authenticate,
  requireAdmin,
  reorderImagesForCarController,
);

carImageRouter.put(
  "/:imageId",
  authenticate,
  requireAdmin,
  updateImageForCar,
);

carImageRouter.patch(
  "/:imageId/primary",
  authenticate,
  requireAdmin,
  setPrimaryImageForCar,
);

carImageRouter.delete(
  "/:imageId",
  authenticate,
  requireAdmin,
  deleteImageForCar,
);

export default carImageRouter;