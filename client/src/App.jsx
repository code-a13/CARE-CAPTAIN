import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import BookingPage from './pages/BookingPage'; // The map & form we built!
import RideTracking from './pages/RideTracking'; // The Rapido-style UI!

// The Bouncer
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('carecaptain_token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Real Authenticated Routes */}
        <Route 
          path="/book" 
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Notice the :bookingId dynamic parameter! */}
        <Route 
          path="/track/:bookingId" 
          element={
            <ProtectedRoute>
              <RideTracking />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;