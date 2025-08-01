// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();

// STEP 1: Import the entire controller object
const authController = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
// STEP 2: Use the registerUser function from the controller object
router.post('/register', authController.registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
// STEP 3: Use the loginUser function from the controller object
router.post('/login', authController.loginUser);

module.exports = router;