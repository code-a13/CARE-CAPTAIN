const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // CRITICAL: This was likely missing causing the 500 error

const assistantSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  hasVehicle: { 
    type: Boolean, 
    default: false 
  },
  role: { 
    type: String, 
    default: 'assistant' 
  }
}, { timestamps: true });

// Pre-save hook to hash password before saving to database
assistantSchema.pre('save', async function () {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return; // Notice we just return, no next()
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password
assistantSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Assistant', assistantSchema);