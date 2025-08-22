// server/routes/userRoutes.js

// Use 'import' instead of 'require'
import express from 'express';
import userController from '../controllers/userController.js';   // Must include .js
import authMiddleware from '../middleware/authMiddleware.js';     // Must include .js

// 'router' initialization is the same
const router = express.Router();

// --- Private Routes ---
router.get('/me', authMiddleware, userController.getMe);
router.put('/me', authMiddleware, userController.updateMe);
router.get('/contact/:id', authMiddleware, userController.getUserContact);
// --- Public Route ---
// This must come AFTER the '/me' route
router.get('/:id', userController.getUserProfile);


// Use 'export default' instead of 'module.exports'
export default router;