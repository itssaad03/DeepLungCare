const jwt = require('jsonwebtoken');
const User = require('../model/user'); // Import the User model

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Extract token from Authorization header
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret'); // Use your secret here for token verification
    const doctor = await User.findById(decoded.userId); // Find the doctor by decoded userId

    if (!doctor) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.doctor = doctor; // Attach doctor info to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = authMiddleware;
