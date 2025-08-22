// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Middleware to protect private routes by verifying a user's JWT.
const authMiddleware = (req, res, next) => {
    // Get the token from the 'Authorization' header.
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Expects "Bearer <token>" format.
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Token is malformed' });
    }
    
    const token = tokenParts[1];
    try {
        // Verify the token.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.user) {
          return res.status(401).json({ message: 'Token payload is invalid' });
        }
        
        // Attach user info to the request object.
        req.user = decoded.user;
        
        // Pass control to the next function.
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = authMiddleware;