import { useState } from 'react';
import { io } from 'socket.io-client';

// Connect to backend
const socket = io('http://localhost:5000');

const CaregiverSimulator = ({ bookingId }) => {
  // Starting somewhere in Coimbatore
  const [currentLocation, setCurrentLocation] = useState({ lat: 11.0168, lng: 77.0150 });

  const joinRoom = () => {
    socket.emit('joinBookingRoom', bookingId);
    alert("Caregiver Joined Room: " + bookingId);
  };

  const moveAssistant = () => {
    // Simulate moving slightly North-East by adding a small decimal
    const newLocation = {
      lat: currentLocation.lat + 0.002, 
      lng: currentLocation.lng + 0.002
    };
    
    setCurrentLocation(newLocation);

    // Send the live location through the WebSocket tunnel!
    socket.emit('assistantLocationUpdate', {
      bookingId,
      lat: newLocation.lat,
      lng: newLocation.lng
    });
  };

  return (
    <div className="p-6 bg-gray-800 text-white rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-green-400">📱 Caregiver App Simulator</h2>
      <p className="mb-4 text-sm text-gray-400">Simulate the assistant moving on their bike.</p>
      
      <div className="space-y-4">
        <button 
          onClick={joinRoom}
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-bold"
        >
          1. Connect to Booking ({bookingId})
        </button>

        <button 
          onClick={moveAssistant}
          className="w-full bg-green-600 hover:bg-green-700 p-3 rounded-lg font-bold"
        >
          2. Move Assistant 🏍️
        </button>
      </div>

      <div className="mt-4 text-xs font-mono text-gray-300">
        Current GPS: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
      </div>
    </div>
  );
};

export default CaregiverSimulator;