import express from "express";
import {
  createUser,
  deleteUser,
  fetchUser,
  loginUser,
  updateUser,
} from "../controller/authController.js";

const router = express.Router();

// Create User
router.post("/create", createUser);

// Login User
router.post("/login", loginUser);

// Update User
router.patch("/update/:id", updateUser);

// Fetch User
router.get("/all", fetchUser);

// Delete User
router.delete("/delete/:id", deleteUser);

export default router;
