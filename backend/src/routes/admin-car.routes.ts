import { Router } from "express";

import {
  createAdminCar,
  deleteCarController,
  getAdminCarController,
  getAdminCarsController,
  updateAdminCar,
  updateCarFeaturedController,
  updateCarPublicationController,
  updateCarStatusController,
} from "../controllers/car.controller.js";

import {
  authenticate,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const adminCarRouter = Router();

/*
|--------------------------------------------------------------------------
| GET ALL ADMIN VEHICLES
|--------------------------------------------------------------------------
*/

adminCarRouter.get(
  "/",
  authenticate,
  requireAdmin,
  getAdminCarsController,
);

/*
|--------------------------------------------------------------------------
| GET ONE ADMIN VEHICLE
|--------------------------------------------------------------------------
*/

adminCarRouter.get(
  "/:id",
  authenticate,
  requireAdmin,
  getAdminCarController,
);

/*
|--------------------------------------------------------------------------
| CREATE VEHICLE
|--------------------------------------------------------------------------
*/

adminCarRouter.post(
  "/",
  authenticate,
  requireAdmin,
  createAdminCar,
);

/*
|--------------------------------------------------------------------------
| UPDATE VEHICLE
|--------------------------------------------------------------------------
*/

adminCarRouter.put(
  "/:id",
  authenticate,
  requireAdmin,
  updateAdminCar,
);

/*
|--------------------------------------------------------------------------
| UPDATE SALE STATUS
|--------------------------------------------------------------------------
*/

adminCarRouter.patch(
  "/:id/status",
  authenticate,
  requireAdmin,
  updateCarStatusController,
);

/*
|--------------------------------------------------------------------------
| UPDATE PUBLICATION STATUS
|--------------------------------------------------------------------------
*/

adminCarRouter.patch(
  "/:id/publication",
  authenticate,
  requireAdmin,
  updateCarPublicationController,
);

/*
|--------------------------------------------------------------------------
| TOGGLE FEATURED STATUS
|--------------------------------------------------------------------------
*/

adminCarRouter.patch(
  "/:id/featured",
  authenticate,
  requireAdmin,
  updateCarFeaturedController,
);

/*
|--------------------------------------------------------------------------
| DELETE DRAFT VEHICLE
|--------------------------------------------------------------------------
*/

adminCarRouter.delete(
  "/:id",
  authenticate,
  requireAdmin,
  deleteCarController,
);

export default adminCarRouter;