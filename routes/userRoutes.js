// server/routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const router = express.Router();

// Private route to get the logged-in user's own profile.
router.get('/me', authMiddleware, userController.getMe);

// Private route to update the logged-in user's own profile.
router.put('/me', authMiddleware, userController.updateMe);

// Private, secure route to get another user's contact info.
router.get('/contact/:id', authMiddleware, userController.getUserContact);

// Public route to get any user's public profile (must be last).
router.get('/:id', userController.getUserProfile);

module.exports = router;