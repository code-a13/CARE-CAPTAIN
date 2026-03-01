// client/src/pages/BookingPage.jsx
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Initialize outside component to prevent multiple connections (Ghost Operators)
const socket = io('http://localhost:5000', { autoConnect: true });

export default function BookingPage() {
  // Map State
  const [position] = useState([11.0168, 76.9558]); // Default location (e.g., Coimbatore)
  
  // Real-Time Ride States
  const [status, setStatus] = useState('idle'); // idle | searching | waiting_for_pickup | in_progress
  const [rideData, setRideData] = useState(null); 
  const [isConnected, setIsConnected] = useState(socket.connected);

  // Dynamic Pricing States
  const [duration, setDuration] = useState(2); // Default 2 hours
  const [needsTransport, setNeedsTransport] = useState(false);

  // The Pricing Engine
  const calculatePrice = () => {
    const baseFare = 150;
    const hourlyRate = 100;
    const transportSurcharge = needsTransport ? 50 : 0;
    return baseFare + (duration * hourlyRate) + transportSurcharge;
  };

  // Socket Connection Lifecycle
  useEffect(() => {
    // 1. Connection Trackers
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    // 2. Ride Event Listeners
    socket.on('ride_booked_success', (data) => {
      console.log("Success data received:", data);
      setRideData(data);
      setStatus('searching');
    });

    socket.on('ride_accepted', () => {
      setStatus('waiting_for_pickup');
    });

    socket.on('ride_started', () => {
      setStatus('in_progress');
    });

    // 3. CRITICAL CLEANUP: Kill the ghost operators when component unmounts
    return () => {
      socket.off('connect'); 
      socket.off('disconnect'); 
      socket.off('ride_booked_success');
      socket.off('ride_accepted'); 
      socket.off('ride_started');
    };
  }, []);

  const requestRide = () => {
    if (!isConnected) return alert("Cannot book: Server is currently disconnected!");
    
    setStatus('searching');
    
    // Payload Hydration: Sending location + the pricing choices to the backend
    socket.emit('request_ride', { 
      lat: position[0], 
      lng: position[1],
      durationHours: duration,
      requiresTransport: needsTransport,
      estimatedPrice: calculatePrice()
    });
  };

  return (
    <div className="flex flex-col h-screen w-full relative bg-gray-100 font-sans">
      
      {/* Live Server Connection Indicator */}
      <div className="absolute top-4 left-4 z-[2000] bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-sm flex items-center gap-2 font-bold text-xs text-gray-700 border border-gray-200">
        <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-red-500'}`}></div>
        {isConnected ? 'System Online' : 'Connecting...'}
      </div>

      {/* The Map Background */}
      <MapContainer center={position} zoom={14} style={{ height: '100%', width: '100%', zIndex: 0 }} zoomControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position}>
          <Popup>Pickup Location</Popup>
        </Marker>
      </MapContainer>

      {/* Enterprise Bottom Sheet */}
      <section className="bg-white rounded-t-[32px] shadow-[0_-20px_40px_rgba(0,0,0,0.1)] p-6 absolute bottom-0 w-full z-[1000] transition-all duration-500 ease-in-out">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4"></div>

        {/* STATE 1: IDLE (Pricing & Preferences) */}
        {status === 'idle' && (
          <div className="animate-fade-in flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Request Care</h2>
              <p className="text-gray-500 font-medium text-sm">Customize your assistance needs.</p>
            </div>

            {/* Duration Slider */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="flex justify-between items-end mb-2">
                <label className="font-bold text-gray-700">Duration</label>
                <span className="text-blue-600 font-black text-xl">{duration} <span className="text-sm text-gray-500">hrs</span></span>
              </div>
              <input 
                type="range" min="1" max="12" value={duration} 
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Transport Toggle */}
            <div 
              onClick={() => setNeedsTransport(!needsTransport)}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center select-none ${needsTransport ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}
            >
              <div>
                <p className="font-bold text-gray-800">Requires Vehicle 🚗</p>
                <p className="text-xs text-gray-500">Caregiver must bring transport</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${needsTransport ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                {needsTransport && <span className="text-white text-xs font-bold">✓</span>}
              </div>
            </div>

            {/* Price Display & Submit Button */}
            <button onClick={requestRide} className="w-full bg-gray-900 hover:bg-black text-white p-4 rounded-2xl shadow-xl flex justify-between items-center active:scale-95 transition-transform mt-2">
              <span className="font-bold text-lg">Confirm Request</span>
              <div className="bg-white/20 px-4 py-1.5 rounded-xl font-black text-xl">
                ₹{calculatePrice()}
              </div>
            </button>
          </div>
        )}

        {/* STATE 2: WAITING FOR SERVER CONFIRMATION */}
        {status === 'searching' && !rideData && (
          <div className="text-center py-6 animate-pulse text-gray-600 font-bold">
            Generating Secure Request...
          </div>
        )}

        {/* STATE 3: BROADCASTING TO CAREGIVERS (Radar) */}
        {status === 'searching' && rideData && (
          <div className="text-center py-6 transition-opacity duration-300">
            <div className="w-14 h-14 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-black text-gray-800">Locating nearby assistants...</h2>
            <p className="text-gray-500 font-medium mt-1">Please wait while we match you.</p>
          </div>
        )}

        {/* STATE 4: MATCHED - SHOW OTP */}
        {status === 'waiting_for_pickup' && rideData && (
          <div className="text-center py-8 bg-green-50 rounded-3xl border border-green-200 shadow-inner animate-fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Caregiver is arriving!</h2>
            <p className="text-gray-600 font-medium mb-4">Share this Start PIN when they arrive.</p>
            
            {/* The dynamically generated OTP from the backend */}
            <div className="text-6xl font-black text-green-700 tracking-[0.2em] bg-white py-6 rounded-2xl shadow-sm mx-6 border border-green-100">
              {rideData.otp}
            </div>
            
            <p className="text-sm text-red-500 mt-6 font-bold flex items-center justify-center gap-2">
              <span className="text-lg">⚠️</span> Do not share over the phone.
            </p>
          </div>
        )}

        {/* STATE 5: OTP VERIFIED - RIDE IN PROGRESS */}
        {status === 'in_progress' && (
          <div className="text-center py-10 bg-blue-600 rounded-3xl shadow-xl animate-fade-in text-white">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-3xl font-black mb-2">Ride Verified!</h2>
            <p className="text-blue-100 font-medium text-lg">Your assistance is now in progress.</p>
          </div>
        )}
      </section>
    </div>
  );
}