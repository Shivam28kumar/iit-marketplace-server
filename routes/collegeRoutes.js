// server/routes/collegeRoutes.js
const express = require('express');
const collegeController = require('../controllers/collegeController.js');
const router = express.Router();

// Public route to get the list of all colleges.
router.get('/', collegeController.getAllColleges);

module.exports = router;