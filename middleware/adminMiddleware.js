// server/middleware/adminMiddleware.js
import User from '../models/User.js';

const adminMiddleware = async (req, res, next) => {
  try {
    // This middleware will run AFTER our standard authMiddleware,
    // so we can be sure that req.user.id exists.
    const user = await User.findById(req.user.id);

    // Check if the user exists and if their role is 'admin'
    if (user && user.role === 'admin') {
      next(); // If they are an admin, allow the request to proceed
    } else {
      // If not, send a "Forbidden" error
      res.status(403).json({ message: 'Admin access required. Authorization denied.' });
    }
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).send('Server Error');
  }
};

export default adminMiddleware;