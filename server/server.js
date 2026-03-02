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

// 3. MIDDLEWARE (UPDATED FOR VERCEL DEPLOYMENT)
// The "Bouncer" is now letting both Localhost and Vercel into the club
app.use(cors({
  origin: [
    'http://localhost:5173',          // For local testing
    'https://care-captain.vercel.app' // For live production
  ],
  credentials: true, // Crucial for tokens/cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());

// 4. API ROUTES (REST)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

// 5. SERVER INITIALIZATION (The Hierarchy)
const server = http.createServer(app);

// UPDATED SOCKET.IO CORS FOR VERCEL
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173', 
      'https://care-captain.vercel.app'
    ],
    methods: ["GET", "POST"],
    credentials: true
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

  // ==========================================
  // ADDED: LIVE GPS TRACKING LOGIC
  // ==========================================
  
  // 1. User joins a specific "room" to listen for their specific caregiver
  socket.on('joinBookingRoom', (bookingId) => {
    socket.join(bookingId);
    console.log(`📍 User joined tracking room: ${bookingId}`);
  });

  // 2. Caregiver sends their GPS coordinates, broadcast it ONLY to that room
  socket.on('locationUpdate', (data) => {
    io.to(data.bookingId).emit('liveLocation', { lat: data.lat, lng: data.lng });
  });

  // ==========================================

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// 7. START LISTENING
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});