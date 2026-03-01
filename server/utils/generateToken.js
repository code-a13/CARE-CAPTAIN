const express = require('express');
const router = express.Router();
const { createBooking } = require('../controllers/bookingController');

// When a POST request hits /api/bookings, send it to the controller
router.post('/', createBooking);

module.exports = router;