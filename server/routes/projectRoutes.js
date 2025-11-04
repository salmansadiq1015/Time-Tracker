import express from 'express';
import { isAdmin, isAuthenticated } from '../middlewares/authMiddleware.js';
import {
  addEmployeeToProject,
  createProject,
  deleteProject,
  fetchAllProjects,
  getProjectById,
  removeEmployeeFromProject,
  updateProject,
} from '../controller/projectController.js';

const router = express.Router();

// Create Project
router.post('/create', isAuthenticated, isAdmin, createProject);

// Update Project
router.patch('/update/:id', isAuthenticated, updateProject);

// Fetch All Project
router.get('/all', fetchAllProjects);

// Fetch Project Details
router.get('/details/:id', getProjectById);

// Delete Project
router.delete('/delete/:id', isAuthenticated, isAdmin, deleteProject);

// Add User in Project
router.patch('/add/employee/:id', isAuthenticated, addEmployeeToProject);

// Remove user from project
router.patch('/remove/employee/:id', isAuthenticated, removeEmployeeFromProject);

export default router;
