import { Router } from "express";

import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../controllers/favorite.controller.js";
import {
  authenticate,
  requireCustomer,
} from "../middleware/auth.middleware.js";

const favoriteRouter = Router();

favoriteRouter.get(
  "/",
  authenticate,
  requireCustomer,
  getFavorites,
);

favoriteRouter.post(
  "/:carId",
  authenticate,
  requireCustomer,
  addFavorite,
);

favoriteRouter.delete(
  "/:carId",
  authenticate,
  requireCustomer,
  removeFavorite,
);

export default favoriteRouter;