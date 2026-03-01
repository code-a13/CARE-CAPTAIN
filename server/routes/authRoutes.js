const express = require('express');
const router = express.Router();
// Destructure the exact function names exported from the controller
const { registerUser, loginUser } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;