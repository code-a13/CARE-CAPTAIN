const User = require('../models/User');
const Assistant = require('../models/Assistant'); // Import the Assistant Model
const generateToken = require('../utils/generateToken');

// @desc    Register new user OR assistant
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, phone, password, role, emergencyContact, hasVehicle } = req.body;

    // IF ROLE IS ASSISTANT
    if (role === 'assistant') {
      const assistantExists = await Assistant.findOne({ phone });
      if (assistantExists) return res.status(400).json({ message: 'Caregiver already exists!' });

      const assistant = await Assistant.create({
        name, phone, password, hasVehicle
      });

      if (assistant) {
        return res.status(201).json({
          _id: assistant._id,
          name: assistant.name,
          phone: assistant.phone,
          role: assistant.role,
          token: generateToken(assistant._id),
        });
      }
    } 
    // IF ROLE IS USER (Default)
    else {
      const userExists = await User.findOne({ phone });
      if (userExists) return res.status(400).json({ message: 'User already exists!' });

      const user = await User.create({
        name, phone, password, emergencyContact
      });

      if (user) {
        return res.status(201).json({
          _id: user._id,
          name: user.name,
          phone: user.phone,
          role: 'user',
          token: generateToken(user._id),
        });
      }
    }

    res.status(400).json({ message: 'Invalid data' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user OR assistant
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { phone, password, role } = req.body; // Frontend MUST send the role now during login!

    // Determine which collection to search based on the role
    const Model = role === 'assistant' ? Assistant : User;
    
    const account = await Model.findOne({ phone });

    // Check if account exists AND password matches
    if (account && (await account.matchPassword(password))) {
      res.json({
        _id: account._id,
        name: account.name,
        phone: account.phone,
        role: role || 'user', // Send role back to frontend
        token: generateToken(account._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid phone number or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };