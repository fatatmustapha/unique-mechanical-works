import { Router } from "express";
import { getCars, getCarById, createCar, updateCar, deleteCar, addCarImage } from "../controllers/cars.controller";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/", getCars);                                            // public: browse/filter
router.get("/:id", getCarById);                                       // public: single listing
router.post("/", requireAuth, requireAdmin, createCar);               // admin: add listing
router.put("/:id", requireAuth, requireAdmin, updateCar);             // admin: edit listing
router.delete("/:id", requireAuth, requireAdmin, deleteCar);          // admin: remove listing
router.post("/:id/images", requireAuth, requireAdmin, addCarImage);   // admin: attach photo

export default router;