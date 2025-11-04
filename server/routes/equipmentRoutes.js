import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/authMiddleware.js";
import {
  createEquipment,
  deleteEquipment,
  fetchAllEquipment,
  getEquipmentById,
  updateEquipment,
  updateEquipmentStatus,
} from "../controller/equipmentController.js";

const router = express.Router();

// Create Equipment
router.post("/create", isAuthenticated, isAdmin, createEquipment);

// Update Equipment
router.patch("/update/:id",isAuthenticated, isAdmin, updateEquipment);

// Update Status
router.patch("/status/:id", isAuthenticated, updateEquipmentStatus);

// Fetch All
router.get("/all", fetchAllEquipment);

// Fetch Details
router.get("/details/:id", getEquipmentById);

// Delete
router.delete("/delete/:id", deleteEquipment);

export default router;
