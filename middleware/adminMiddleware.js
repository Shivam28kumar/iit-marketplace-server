// server/middleware/adminMiddleware.js
const User = require('../models/User.js');

// Middleware to protect admin-only routes.
// This middleware MUST run AFTER the standard authMiddleware.
const adminMiddleware = async (req, res, next) => {
  try {
    // We can be sure 'req.user.id' exists because authMiddleware ran first.
    const user = await User.findById(req.user.id);

    // Check if the user exists and their role is 'admin'.
    if (user && user.role === 'admin') {
      next(); // If yes, allow the request to proceed.
    } else {
      res.status(403).json({ message: 'Admin access required. Authorization denied.' });
    }
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).send('Server Error');
  }
};

module.exports = adminMiddleware;