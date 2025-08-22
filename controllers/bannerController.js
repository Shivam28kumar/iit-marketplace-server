// server/controllers/bannerController.js
const Banner = require('../models/Banner.js');

// @desc    Get all active banners
const getActiveBanners = async (req, res) => {
    try {
        const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(banners);
    } catch (err) {
        console.error("Controller Error (getActiveBanners):", err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = { getActiveBanners };