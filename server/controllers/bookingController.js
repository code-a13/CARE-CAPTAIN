// server/controllers/bookingController.js
const Booking = require('../models/Booking');

// @desc    Create a new assistance booking
// @route   POST /api/bookings
// @access  Protected (Requires JWT - we will add this middleware later)
const createBooking = async (req, res) => {
  try {
    // 1. Extract the data sent by the React frontend
    const { userId, requiresTransport, durationHours, lng, lat } = req.body;

    // 2. Basic Validation
    if (!userId || !durationHours || !lng || !lat) {
      return res.status(400).json({ message: 'Please provide all required fields, including location coordinates.' });
    }

    // 3. Construct the Database Document
    const booking = await Booking.create({
      userId,
      requiresTransport: requiresTransport || false,
      durationHours,
      pickupLocation: {
        type: 'Point',
        coordinates: [lng, lat] // MongoDB requires Longitude FIRST, then Latitude
      },
      status: 'pending'
    });

    // 4. Return the successful booking ID to the frontend
    if (booking) {
      res.status(201).json({
        message: 'Booking created successfully',
        bookingId: booking._id,
        status: booking.status
      });
    } else {
      res.status(400).json({ message: 'Invalid booking data received' });
    }

  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  createBooking
};