// server/routes/adminRoutes.js

// --- MODULE IMPORTS using CommonJS 'require' ---
const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware.js');
const adminMiddleware = require('../middleware/adminMiddleware.js'); // The admin guard
const adminController = require('../controllers/adminController.js');

// Create a new router instance. This is only done once.
const router = express.Router();

// Configure multer for file uploads (specifically for banner creation).
const upload = multer({ dest: 'uploads/' });

// --- MIDDLEWARE CHAIN for Admin-Only Routes ---
// This is a clean way to apply both security checks to our routes.
// The request will first pass through authMiddleware, then adminMiddleware.
const adminOnly = [authMiddleware, adminMiddleware];

// --- User Management Routes ---
router.get('/users', adminOnly, adminController.getAllUsers);
router.delete('/users/:id', adminOnly, adminController.deleteUser);

// --- Product Management Routes ---
router.delete('/products/:id', adminOnly, adminController.deleteProduct);

// --- College Management Routes ---
router.post('/colleges', adminOnly, adminController.createCollege);
router.delete('/colleges/:id', adminOnly, adminController.deleteCollege);

// --- Banner Management Routes ---
// The 'createBanner' route also needs the 'upload.single('image')' middleware to handle the file.
router.post('/banners', adminOnly, upload.single('image'), adminController.createBanner);
router.delete('/banners/:id', adminOnly, adminController.deleteBanner);

// --- MODULE EXPORTS using CommonJS 'module.exports' ---
module.exports = router;