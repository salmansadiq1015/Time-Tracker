import express from 'express';
import { isAdmin, isAuthenticated } from '../middlewares/authMiddleware.js';
import {
  createAssignment,
  deleteAssignment,
  fetchAllAssignments,
  getAssignmentById,
  updateAssignment,
} from '../controller/assignmentController.js';

const router = express.Router();

// Create Assignment
router.post('/create', isAuthenticated, isAdmin, createAssignment);

// Fetch All Assignments
router.get('/all', isAuthenticated, fetchAllAssignments);

// Get Assignment by ID
router.get('/:id', isAuthenticated, getAssignmentById);

// Update Assignment
router.patch('/update/:id', isAuthenticated, isAdmin, updateAssignment);

// Delete Assignment
router.delete('/delete/:id', isAuthenticated, isAdmin, deleteAssignment);

export default router;
