import express from 'express';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import {
  createChat,
  fetchChats,
  groupChat,
  fetchGroupChat,
  updateGroupChat,
  renameGroup,
  removeUser,
  addUser,
  deleteChat,
} from '../controller/chatController.js';
import {
  getMessages,
  sendMessage,
  markMessagesRead,
  addReaction,
} from '../controller/messageController.js';

const router = express.Router();

// One-to-one chat
router.post('/create', isAuthenticated, createChat);
router.get('/all/:id', isAuthenticated, fetchChats);

// Group chat
router.post('/group/create', isAuthenticated, groupChat);
router.get('/group/:id', isAuthenticated, fetchGroupChat);
router.patch('/group/update/:id', isAuthenticated, updateGroupChat);
router.patch('/group/rename/:id', isAuthenticated, renameGroup);
router.patch('/group/add/:id', isAuthenticated, addUser);
router.patch('/group/remove/:id', isAuthenticated, removeUser);

// Delete chat
router.delete('/delete/:id', isAuthenticated, deleteChat);

// ====================Messages====================
router.post('/message/create', isAuthenticated, sendMessage);
router.get('/message/:id', isAuthenticated, getMessages);
router.patch('/message/read/:id', isAuthenticated, markMessagesRead);
router.post('/message/reaction/:messageId', isAuthenticated, addReaction);

export default router;
