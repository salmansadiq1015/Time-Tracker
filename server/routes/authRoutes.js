import express from "express";
import {
  createUser,
  deleteUser,
  fetchUser,
  loginUser,
  updateUser,
} from "../controller/authController.js";
import { isAdmin, isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create User
router.post("/create", isAuthenticated, isAdmin, createUser);

// Login User
router.post("/login", loginUser);

// Update User
router.patch("/update/:id", isAuthenticated, isAdmin, updateUser);

// Fetch User
router.get("/all", fetchUser);

// Delete User
router.delete("/delete/:id", isAuthenticated, isAdmin, deleteUser);

export default router;
