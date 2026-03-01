// server/server.js

// 1. IMPORTS
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');

// 2. CONFIGURATION
dotenv.config();
connectDB();
const app = express();

// 3. MIDDLEWARE
app.use(cors());
app.use(express.json());

// 4. API ROUTES (REST)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

// 5. SERVER INITIALIZATION (The Hierarchy)
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Allow Vite frontend to connect
    methods: ["GET", "POST"]
  }
});

// 6. REAL-TIME SOCKET LOGIC (Now it is safe to use 'io')
const activeRides = {}; // Temporary memory to hold dynamic OTPs

io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // ELDERLY USER REQUESTS RIDE
  socket.on('request_ride', (bookingData) => {
    const dynamicOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const bookingId = `BK-${Date.now()}`; 

    activeRides[bookingId] = { otp: dynamicOtp, ...bookingData };

    // Send secret OTP to user
    socket.emit('ride_booked_success', { bookingId, otp: dynamicOtp });
    // Broadcast request to Caregivers
    socket.broadcast.emit('new_ride_available', { bookingId, ...bookingData });
  });

  // CAREGIVER ACCEPTS RIDE
  socket.on('accept_ride', (data) => {
    socket.broadcast.emit('ride_accepted', { bookingId: data.bookingId, caregiverName: "CareCaptain Assistant" });
  });

  // CAREGIVER ENTERS OTP
  socket.on('verify_otp', (data) => {
    const ride = activeRides[data.bookingId];
    
    if (ride && ride.otp === data.enteredOtp) {
      socket.emit('otp_result', { success: true, message: "Verification successful! Ride started." });
      socket.broadcast.emit('ride_started', { bookingId: data.bookingId });
    } else {
      socket.emit('otp_result', { success: false, message: "Invalid OTP. Try again." });
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// 7. START LISTENING
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});