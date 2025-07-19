import express from "express";
import {
  getAllCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  searchCars,
} from "../controllers/carsController.js";
import {
  validateCar,
  validateCarUpdate,
  validateCarSearch,
} from "../middleware/validateCar.js";
import { authMiddleware } from "../middleware/authentication.js";

const router = express.Router();

// Public Routes
router.get("/", getAllCars);
router.get("/search", validateCarSearch, searchCars);
router.get("/:id", getCarById);

// Protected Routes
router.post("/sell-car", authMiddleware, validateCar, createCar);
router.patch("/:id", authMiddleware, validateCarUpdate, updateCar);
router.delete("/:id", authMiddleware, deleteCar);

export default router;
