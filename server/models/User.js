const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Import bcrypt

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Added password field
  emergencyContact: { type: String, required: true },
  medicalNotes: { type: String }, 
}, { timestamps: true });

// A special method to compare passwords during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware: Before saving a new user to DB, hash their password!
userSchema.pre('save', async function (next) {
  // If password is not modified, move on
  if (!this.isModified('password')) {
    next();
  }
  // Generate a salt (random string) to make the hash super secure
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);