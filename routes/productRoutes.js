// server/routes/productRoutes.js

// Use 'import' instead of 'require'
import express from 'express';
import multer from 'multer';
import productController from '../controllers/productController.js'; // Must include .js
import authMiddleware from '../middleware/authMiddleware.js';     // Must include .js

// 'router' initialization is the same
const router = express.Router();

// Multer configuration is the same
const upload = multer({ dest: 'uploads/' });

// Route definitions are the same
router.get('/', productController.getAllProducts);
router.get('/user/:userId', productController.getProductsByUserId);
router.get('/:id', productController.getProductById);
router.post('/', authMiddleware, upload.single('image'), productController.createProduct);
router.put('/:id', authMiddleware, upload.single('image'), productController.updateProduct);
router.delete('/:id', authMiddleware, productController.deleteProduct);

// Use 'export default' instead of 'module.exports'
export default router;