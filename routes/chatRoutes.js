import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import chatController from '../controllers/chatController.js';
const router = express.Router();

router.get('/conversations', authMiddleware, chatController.getUserConversations);
router.get('/unread-count', authMiddleware, chatController.getUnreadCount);
router.get('/:id', authMiddleware, chatController.getMessages);
router.post('/send/:id', authMiddleware, chatController.sendMessage);
router.put('/read/:conversationId', authMiddleware, chatController.markAsRead);

export default router; // <-- MUST have this line