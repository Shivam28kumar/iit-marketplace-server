// server/routes/shopRoutes.js
const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController.js');
const authMiddleware = require('../middleware/authMiddleware.js');
// Public route to get list of all shops
router.get('/', shopController.getAllShops);

// Public route to get the menu of a specific shop
router.get('/:shopId/menu', shopController.getShopMenu);
router.put('/status', authMiddleware, shopController.toggleShopStatus);
router.get('/:id', shopController.getShopDetails); 
router.put('/status', authMiddleware, shopController.toggleShopStatus);
router.put('/settings', authMiddleware, shopController.updateShopSettings);


module.exports = router;