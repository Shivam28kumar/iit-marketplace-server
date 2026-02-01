// server/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware.js');
const orderController = require('../controllers/orderController.js');

// Protected routes (User must be logged in)

// POST /api/orders -> Place a new order
router.post('/', authMiddleware, orderController.placeOrder);

// GET /api/orders/shop -> Get orders for the logged-in shop owner
router.get('/shop', authMiddleware, orderController.getShopOrders);
router.get('/user', authMiddleware, orderController.getUserOrders);
// PUT /api/orders/:id/status -> Update order status
router.put('/:id/status', authMiddleware, orderController.updateOrderStatus);

module.exports = router;