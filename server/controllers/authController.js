const User = require('../models/User');
const Assistant = require('../models/Assistant');
const generateToken = require('../utils/generateToken'); // Make sure you have this utility!

// @desc    Register new user OR assistant
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, phone, password, role, emergencyContact, hasVehicle } = req.body;

    // 1. Basic Validation
    if (!name || !phone || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // 2. Role-Based Switch: Handle Assistant Registration
    if (role === 'assistant') {
      const assistantExists = await Assistant.findOne({ phone });
      if (assistantExists) {
        return res.status(400).json({ message: 'Assistant with this phone number already exists' });
      }

      const assistant = await Assistant.create({
        name,
        phone,
        password, // Hashed by the pre-save hook in the model
        hasVehicle: hasVehicle || false,
        role: 'assistant'
      });

      if (assistant) {
        return res.status(201).json({
          _id: assistant._id,
          name: assistant.name,
          phone: assistant.phone,
          role: assistant.role,
          token: generateToken(assistant._id)
        });
      }
    } 
    
    // 3. Role-Based Switch: Handle User Registration
    else if (role === 'user') {
      const userExists = await User.findOne({ phone });
      if (userExists) {
        return res.status(400).json({ message: 'User with this phone number already exists' });
      }

      if (!emergencyContact) {
        return res.status(400).json({ message: 'Emergency contact is required for users' });
      }

      const user = await User.create({
        name,
        phone,
        password, // Hashed by the pre-save hook in the model
        emergencyContact,
        role: 'user' 
      });

      if (user) {
        return res.status(201).json({
          _id: user._id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          token: generateToken(user._id)
        });
      }
    } else {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    res.status(400).json({ message: 'Invalid user data' });

  } catch (error) {
    console.error("REGISTER API ERROR:", error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Auth user/assistant & get token
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { phone, password, role } = req.body;

    // 1. Basic Validation
    if (!phone || !password || !role) {
      return res.status(400).json({ message: 'Please provide phone, password, and role' });
    }

    let account = null;

    // 2. Role-Aware Database Query
    if (role === 'assistant') {
      account = await Assistant.findOne({ phone });
    } else if (role === 'user') {
      account = await User.findOne({ phone });
    } else {
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    // 3. Verify Account Exists AND Password Matches
    if (account && (await account.matchPassword(password))) {
      res.json({
        _id: account._id,
        name: account.name,
        phone: account.phone,
        role: account.role,
        token: generateToken(account._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid phone number or password' }); 
    }

  } catch (error) {
    console.error("LOGIN API ERROR:", error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// CRITICAL: Export both functions so the router can see them
module.exports = {
  registerUser,
  loginUser
};