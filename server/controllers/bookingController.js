const Booking = require('../models/Booking'); // Using the Booking schema we discussed earlier
const Assistant = require('../models/Assistant');

// @desc    Create a new assistance booking
// @route   POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { userId, requiresTransport, durationHours, lng, lat } = req.body;

    // 1. Logic Validation
    if (!lng || !lat) {
      return res.status(400).json({ message: 'Map coordinates are required, macha!' });
    }

    // 2. Find an available assistant based on transport requirement
    const query = { isAvailable: true };
    if (requiresTransport) {
      query.hasVehicle = true; // Only find assistants with a bike/car
    }

    // Note: For a prototype, we just pick the first available one. 
    // Later, we will use geo-spatial queries to find the *nearest* one.
    const assignedAssistant = await Assistant.findOne(query);

    if (!assignedAssistant) {
      return res.status(404).json({ message: 'No suitable assistants available right now.' });
    }

    // 3. Create the Booking in DB
    const newBooking = await Booking.create({
      userId,
      assistantId: assignedAssistant._id,
      requiresTransport,
      hourlyRate: requiresTransport ? 250 : 150, // Higher rate if transport is needed
      durationHours,
      pickupLocation: {
        type: 'Point',
        coordinates: [lng, lat] // MongoDB requires Longitude first, then Latitude!
      }
    });

    // 4. Mark assistant as busy
    assignedAssistant.isAvailable = false;
    await assignedAssistant.save();

    res.status(201).json({
      success: true,
      data: newBooking,
      message: 'Caregiver booked successfully!'
    });

  } catch (error) {
    console.error('Booking Error:', error);
    res.status(500).json({ message: 'Server error while booking' });
  }
};

module.exports = { createBooking };