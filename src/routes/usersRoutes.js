import express from "express";
import {
  getAllUsers,
  getUserById,
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
  getUserCars,
  refreshToken,
} from "../controllers/usersController.js";
import {
  validateUser,
  validateUserUpdate,
  validateUserLogin,
} from "../middleware/validateUser.js";
import { authMiddleware } from "../middleware/authentication.js";
import { restrictTo } from "../middleware/authorization.js";

const router = express.Router();

// Public Routes
router.post("/register", validateUser, registerUser);
router.post("/login", validateUserLogin, loginUser);
router.get("/refresh", refreshToken);

// Protected Routes
router.get("/", authMiddleware, restrictTo("admin"), getAllUsers);
router.get("/:id", authMiddleware, getUserById);
router.get("/:id/cars", authMiddleware, getUserCars);
router.patch("/:id", authMiddleware, validateUserUpdate, updateUser);
router.delete("/:id", authMiddleware, restrictTo("admin"), deleteUser);

export default router;
