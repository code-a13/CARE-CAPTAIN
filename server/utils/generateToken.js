const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  // Signs a token with the user's ID and your secret key, expiring in 30 days
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '30d',
  });
};

module.exports = generateToken;