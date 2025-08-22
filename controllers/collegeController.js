// server/controllers/collegeController.js
const College = require('../models/College.js');

// Handles fetching the list of all colleges.
const getAllColleges = async (req, res) => {
  try {
    const colleges = await College.find().sort({ name: 1 });
    res.json(colleges);
  } catch (err) {
    console.error("Controller Error (getAllColleges):", err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = { getAllColleges };