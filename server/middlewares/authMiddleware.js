const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check if the frontend sent the token in the Headers (Bearer token standard)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (Format: "Bearer <token_string>")
      token = req.headers.authorization.split(' ')[1];

      // Verify token with our secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch the user from DB (except their password) and attach it to req.user
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Bouncer says: "All good, you can go to the controller now!"
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed!' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided!' });
  }
};

module.exports = { protect };