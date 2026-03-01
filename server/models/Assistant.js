const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // MUST import bcrypt here!

const assistantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Added this!
  hasVehicle: { type: Boolean, required: true, default: false },
  isAvailable: { type: Boolean, default: true },
  rating: { type: Number, default: 5.0 },
  role: { type: String, default: 'assistant' } // Helps identify them easily
}, { timestamps: true });

// Password comparison for Login
assistantSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Hash password before saving during Registration
assistantSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('Assistant', assistantSchema);