// server/routes/adminRoutes.js
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js'; // Import our new admin guard
import adminController from '../controllers/adminController.js';
import multer from 'multer'; 

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Configure multer
// --- All routes in this file are protected and for admins only ---
// The request must pass through authMiddleware first, then adminMiddleware,
// before it can reach the controller function.
const adminOnly = [authMiddleware, adminMiddleware];

// User management routes
router.get('/users', adminOnly, adminController.getAllUsers);
router.delete('/users/:id', adminOnly, adminController.deleteUser);

// Product management routes
router.delete('/products/:id', adminOnly, adminController.deleteProduct);

// College management routes
router.post('/colleges', adminOnly, adminController.createCollege);
router.delete('/colleges/:id', adminOnly, adminController.deleteCollege);

// --- NEW BANNER ROUTES ---
router.post('/banners', adminOnly, upload.single('image'), adminController.createBanner);
router.delete('/banners/:id', adminOnly, adminController.deleteBanner);

export default router;