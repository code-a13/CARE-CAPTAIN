const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  assistantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Assistant' 
  },
  status: { 
    type: String, 
    enum: ['PENDING', 'ACCEPTED', 'ON_GOING', 'COMPLETED', 'CANCELLED'], 
    default: 'PENDING' 
  },
  requiresTransport: { type: Boolean, required: true },
  hourlyRate: { type: Number, required: true },
  durationHours: { type: Number, required: true },
  pickupLocation: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  }
}, { timestamps: true });

// Geo-spatial index for map queries
bookingSchema.index({ pickupLocation: '2dsphere' });

module.exports = mongoose.model('Booking', bookingSchema);