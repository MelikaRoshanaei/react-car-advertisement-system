import express from "express";
import {
  getAllUsers,
  getUserById,
  registerUser,
  updateUser,
  deleteUser,
  getUserCars,
} from "../controllers/usersController.js";
import {
  validateUser,
  validateUserUpdate,
} from "../middleware/validateUser.js";

const router = express.Router();

router.get("/", getAllUsers);
router.post("/register", validateUser, registerUser);
router.get("/:id", getUserById);
router.get("/:id/cars", getUserCars);
router.patch("/:id", validateUserUpdate, updateUser);
router.delete("/:id", deleteUser);

export default router;
