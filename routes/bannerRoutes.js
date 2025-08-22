// server/routes/bannerRoutes.js
const express = require('express');
const bannerController = require('../controllers/bannerController.js');
const router = express.Router();

// Public route to get all active banners.
router.get('/', bannerController.getActiveBanners);

module.exports = router;