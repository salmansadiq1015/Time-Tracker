import express from "express";
import {
  deleteTimer,
  fetchTimers,
  startTimer,
  stopTimer,
  updateTimer,
} from "../controller/timerController.js";
import { isAdmin, isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Start Timer
router.post("/start", isAuthenticated, startTimer);

// Stop Timer
router.patch("/stop/:id", isAuthenticated, stopTimer);

// Update Timer
router.patch("/update/:id", isAuthenticated, updateTimer);

// Fetch Timer
router.get("/all", fetchTimers);

// Delete Timer
router.delete("/delete/:id", isAuthenticated, deleteTimer);

export default router;
