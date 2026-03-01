// server/models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Links to the Elderly person who requested it
    required: true 
  },
  assistantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Assistant', // Will be null until a caregiver accepts
    default: null
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'completed', 'cancelled'], // Strict validation
    default: 'pending' 
  },
  requiresTransport: {
    type: Boolean,
    default: false
  },
  durationHours: {
    type: Number,
    required: true,
    min: 1
  },
  // CRITICAL: MongoDB GeoJSON format for location tracking
  pickupLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // Note: MongoDB requires [longitude, latitude]
      required: true
    }
  }
}, { timestamps: true });

// Create a 2dsphere index so we can search for "caregivers near me" later
bookingSchema.index({ pickupLocation: '2dsphere' });

module.exports = mongoose.model('Booking', bookingSchema);