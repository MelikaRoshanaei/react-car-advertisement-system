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

const router = express.Router();

router.get("/", getAllCars);
router.get("/search", validateCarSearch, searchCars);
router.post("/sell-car", validateCar, createCar);
router.get("/:id", getCarById);
router.patch("/:id", validateCarUpdate, updateCar);
router.delete("/:id", deleteCar);

export default router;
