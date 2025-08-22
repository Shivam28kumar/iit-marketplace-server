// server/routes/productRoutes.js
const express = require('express');
const multer = require('multer');
const productController = require('../controllers/productController.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const router = express.Router();

// Configure multer to handle file uploads.
const upload = multer({ dest: 'uploads/' });

// Public route to get all products (with filtering).
router.get('/', productController.getAllProducts);

// Public route to get all products for a specific user.
router.get('/user/:userId', productController.getProductsByUserId);

// Public route to get a single product by its ID.
router.get('/:id', productController.getProductById);

// Private route to create a new product.
router.post('/', authMiddleware, upload.single('image'), productController.createProduct);

// Private route to update a product.
router.put('/:id', authMiddleware, upload.single('image'), productController.updateProduct);

// Private route to delete a product.
router.delete('/:id', authMiddleware, productController.deleteProduct);

module.exports = router;