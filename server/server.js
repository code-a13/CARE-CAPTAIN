const express = require('express');
const cors = require('cors'); // 1. Import CORS
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// 2. USE CORS MIDDLEWARE (Must be before routes)
app.use(cors()); 

app.use(express.json());

// Your existing routes
app.use('/api/auth', require('./routes/authRoutes'));
// ... other routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));