import { useState } from 'react';
import axios from 'axios';
import { Car, User, Clock, CheckCircle } from 'lucide-react';
import MapWidget from '../components/MapWidget';
import { useNavigate } from 'react-router-dom';



const BookingPage = () => {
  // 1. The Single Source of Truth (State)
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [requiresTransport, setRequiresTransport] = useState(false);
  const [duration, setDuration] = useState(2); // Default 2 hours
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 2. The API Call function
  const handleBooking = async () => {
    if (!location) {
      setErrorMsg("Please wait for map to load your location, macha!");
      return;
    }

    setLoading(true);
    setErrorMsg('');
    
    try {
      // Get the VIP pass (JWT) we saved during login
      const token = localStorage.getItem('carecaptain_token'); 
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`, // Pass it to the bouncer!
        },
      };

      const payload = {
        requiresTransport,
        durationHours: duration,
        lng: location.longitude,
        lat: location.latitude,
      };

      // Hit the backend controller we built!
      const { data } = await axios.post('http://localhost:5000/api/bookings', payload, config);
      setSuccessMsg(`Success! Caregiver booked. ID: ${data.data._id}`);
      navigate('/booking-success');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  // 3. The Enterprise UI (Tailwind CSS)
  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-10">
      {/* Header */}
      <div className="bg-rose-600 text-white p-6 shadow-md rounded-b-3xl">
        <h1 className="text-2xl font-bold tracking-wide">Book Assistance</h1>
        <p className="text-rose-100 mt-1">We'll send help to your location</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Map Section */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-semibold text-gray-500 mb-2 flex items-center">
            <CheckCircle className="w-4 h-4 mr-1 text-green-500" /> Verify Your Location
          </p>
          {/* Passing the state updater function to the child component! */}
          <MapWidget onLocationSelect={setLocation} />
        </div>

        {/* Transport Options Section */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">Need a vehicle?</h2>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setRequiresTransport(false)}
              className={`p-4 rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${!requiresTransport ? 'border-rose-600 bg-rose-50 text-rose-700' : 'border-gray-200 bg-white text-gray-500'}`}
            >
              <User size={32} className="mb-2" />
              <span className="font-semibold text-lg">Just Help</span>
              <span className="text-xs">₹150/hr</span>
            </button>

            <button 
              onClick={() => setRequiresTransport(true)}
              className={`p-4 rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${requiresTransport ? 'border-rose-600 bg-rose-50 text-rose-700' : 'border-gray-200 bg-white text-gray-500'}`}
            >
              <Car size={32} className="mb-2" />
              <span className="font-semibold text-lg">With Car/Auto</span>
              <span className="text-xs">₹250/hr</span>
            </button>
          </div>
        </div>

        {/* Duration Slider Section */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-rose-600" /> Duration
            </h2>
            <span className="text-xl font-bold text-rose-600">{duration} Hours</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="12" 
            value={duration} 
            onChange={(e) => setDuration(e.target.value)}
            className="w-full accent-rose-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Status Messages */}
        {errorMsg && <div className="p-3 bg-red-100 text-red-700 rounded-xl text-center font-medium border border-red-200">{errorMsg}</div>}
        {successMsg && <div className="p-3 bg-green-100 text-green-700 rounded-xl text-center font-medium border border-green-200">{successMsg}</div>}

        {/* Giant Submit Button */}
        <button 
          onClick={handleBooking}
          disabled={loading}
          className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white font-bold text-xl py-4 rounded-2xl shadow-lg transition-transform transform active:scale-95 flex justify-center items-center mt-6"
        >
          {loading ? 'Booking...' : `Confirm Booking • ₹${(requiresTransport ? 250 : 150) * duration}`}
        </button>
      </div>
    </div>
  );
};

export default BookingPage;