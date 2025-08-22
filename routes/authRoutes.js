// server/routes/authRoutes.js
import express from 'express';
import authController from '../controllers/authController.js'; // Import the controller object

const router = express.Router();

// Route for handling user registration (sends an OTP)
router.post('/register', authController.registerUser);

// Route for handling user login (for already verified users)
router.post('/login', authController.loginUser);

// --- THIS IS THE FIX ---
// This line defines the route that the frontend calls when submitting the OTP.
// It links the '/verify-email' path to the 'verifyEmail' function in our controller.
router.post('/verify-email', authController.verifyEmail);

// We will add routes for password reset here later.
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
// Export the router so it can be used by server.js
export default router;