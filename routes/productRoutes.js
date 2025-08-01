// server/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');

// STEP 1: Import the entire controller object
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Public route to get all products
// STEP 2: Use the functions from the imported controller object
router.get('/', productController.getAllProducts);

// Public route to get a single product
router.get('/:id', productController.getProductById);

// Private route to create a new product
router.post('/', authMiddleware, upload.single('image'), productController.createProduct);

module.exports = router;