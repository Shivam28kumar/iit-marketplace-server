// server/controllers/bannerController.js
import Banner from '../models/Banner.js';

// @desc    Get all active banners
// @route   GET /api/banners
// @access  Public
const getActiveBanners = async (req, res) => {
    try {
        // Find all banners where 'isActive' is true and sort them by creation date
        const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(banners);
    } catch (err) {
        console.error("Controller Error (getActiveBanners):", err.message);
        res.status(500).send('Server Error');
    }
};

export default { getActiveBanners };