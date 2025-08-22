// server/routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController.js');
const router = express.Router();

// Defines the endpoint for user registration.
router.post('/register', authController.registerUser);

// Defines the endpoint for user login.
router.post('/login', authController.loginUser);

// Defines the endpoint for submitting an email verification OTP.
router.post('/verify-email', authController.verifyEmail);

// Defines the endpoints for the forgot/reset password flow.
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;