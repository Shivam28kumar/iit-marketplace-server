//server/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

// Middleware function to protect private routes.
const authMiddleware = (req, res, next) => {
    // Get the token from the 'Authorization' header.
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // The token should be in the format "Bearer <token>". We split it to get the token part.
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Token is malformed' });
    }
    
    const token = tokenParts[1];
    try {
        // Verify the token using the secret key. This will throw an error if the token is invalid or expired.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Ensure the decoded token has the expected user payload.
        if (!decoded.user) {
          return res.status(401).json({ message: 'Token payload is invalid' });
        }
        
        // Attach the user information from the token to the request object.
        req.user = decoded.user;
        
        // Pass control to the next function in the request-response cycle (the controller).
        next();
    } catch (err) {
        // If verification fails, deny access.
        res.status(401).json({ message: 'Token is not valid' });
    }
};

export default authMiddleware;