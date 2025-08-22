// server/routes/collegeRoutes.js

// Use 'import' instead of 'require'
import express from 'express';
import collegeController from '../controllers/collegeController.js'; // Must include .js

// 'router' initialization is the same
const router = express.Router();

// Route definition is the same
router.get('/', collegeController.getAllColleges);

// Use 'export default' instead of 'module.exports'
export default router;