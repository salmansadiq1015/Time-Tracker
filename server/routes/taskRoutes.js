import express from 'express';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from '../controller/taskController.js';

const router = express.Router();

router.use(isAuthenticated);

router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTaskById);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
