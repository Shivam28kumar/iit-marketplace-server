// server/routes/bannerRoutes.js
import express from 'express';
import bannerController from '../controllers/bannerController.js';
const router = express.Router();

router.get('/', bannerController.getActiveBanners);

export default router;