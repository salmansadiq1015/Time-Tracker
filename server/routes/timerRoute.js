import express from "express";
import {
  deleteTimer,
  fetchTimers,
  startTimer,
  stopTimer,
  updateTimer,
} from "../controller/timerController.js";

const router = express.Router();

// Start Timer
router.post("/start", startTimer);

// Stop Timer
router.patch("/stop/:id", stopTimer);

// Update Timer
router.patch("/update/:id", updateTimer);

// Fetch Timer
router.get("/all", fetchTimers);

// Delete Timer
router.delete("/delete/:id", deleteTimer);

export default router;
