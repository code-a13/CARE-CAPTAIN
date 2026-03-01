// client/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import CaregiverDashboard from './pages/CaregiverDashboard';
// 1. IMPORT THE NEW PAGE
import BookingPage from './pages/BookingPage'; 

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/caregiver-dashboard" element={<CaregiverDashboard />} />
        
        {/* 2. ADD THE MISSING ROUTE */}
        <Route path="/book" element={<BookingPage />} /> 
      </Routes>
    </div>
  );
}

export default App;