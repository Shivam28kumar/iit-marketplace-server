// server/routes/chatRoutes.js
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware.js');
const chatController = require('../controllers/chatController.js');
const router = express.Router();

// All chat routes are private and require a user to be logged in.
router.get('/conversations', authMiddleware, chatController.getUserConversations);
router.get('/unread-count', authMiddleware, chatController.getUnreadCount);
router.get('/:id', authMiddleware, chatController.getMessages);
router.post('/send/:id', authMiddleware, chatController.sendMessage);
router.put('/read/:id', authMiddleware, chatController.markAsRead); // :id is the other user's ID

module.exports = router;