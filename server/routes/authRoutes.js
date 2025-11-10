import express from 'express';
import {
  createUser,
  deleteUser,
  fetchUser,
  loginUser,
  sendResetPasswordRequest,
  updateUser,
  updatePassword,
  uploadFile,
} from '../controller/authController.js';
import { isAdmin, isAuthenticated } from '../middlewares/authMiddleware.js';
import uploadMiddleware from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Create User
router.post('/create', isAuthenticated, isAdmin, createUser);

// Login User
router.post('/login', loginUser);

// Forgot Password (Phone-based OTP)
router.post('/forgot-password', sendResetPasswordRequest);

// Reset Password
router.post('/reset-password', updatePassword);

// Update User
router.patch('/update/:id', isAuthenticated, isAdmin, updateUser);

// Fetch User
router.get('/all', fetchUser);

// Delete User
router.delete('/delete/:id', isAuthenticated, isAdmin, deleteUser);

// Upload File
router.post('/upload-file', uploadMiddleware, uploadFile);

export default router;
