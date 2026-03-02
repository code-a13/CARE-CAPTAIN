import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Clock, Car, ShieldCheck, MapPin } from 'lucide-react'; // Added some premium icons

// VERCEL FIX: Use the environment variable for the socket connection!
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(API_URL, { autoConnect: true });

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
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

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
    
    socket.emit('request_ride', { 
      lat: position[0], 
      lng: position[1],
      durationHours: duration,
      requiresTransport: needsTransport,
      estimatedPrice: calculatePrice()
    });
  };

  return (
    <div className="flex flex-col h-screen w-full relative bg-blue-50 font-sans">
      
      {/* Live Server Connection Indicator - Styled to match theme */}
      <div className="absolute top-4 left-4 z-[2000] bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-blue-100 flex items-center gap-3 font-bold text-xs text-slate-700">
        <div className="relative flex h-3 w-3">
          {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
          <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
        </div>
        {isConnected ? 'System Online' : 'Reconnecting...'}
      </div>

      {/* The Map Background */}
      <div className="h-full w-full absolute top-0 left-0 z-0 bg-blue-100">
        <MapContainer center={position} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer 
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" // Cleaner, lighter map style
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <Marker position={position}>
            <Popup>
              <div className="font-bold text-blue-900">Pickup Location</div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Enterprise Bottom Sheet */}
      <section className="bg-white rounded-t-[40px] shadow-[0_-20px_60px_rgba(0,0,0,0.08)] p-6 md:p-8 absolute bottom-0 w-full z-[1000] transition-all duration-500 ease-in-out border-t border-blue-50 max-h-[85vh] overflow-y-auto">
        <div className="w-14 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>

        {/* STATE 1: IDLE (Pricing & Preferences) */}
        {status === 'idle' && (
          <div className="animate-fade-in flex flex-col gap-6 max-w-lg mx-auto">
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Request Care</h2>
              <p className="text-slate-500 font-medium text-sm mt-1 flex items-center">
                <MapPin size={16} className="mr-1 text-blue-500" /> Confirm details for your location.
              </p>
            </div>

            {/* Duration Slider - Premium Styling */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-5 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-end mb-4">
                <label className="font-bold text-slate-700 flex items-center">
                  <Clock size={18} className="mr-2 text-blue-600" /> Duration
                </label>
                <span className="text-blue-700 font-black text-2xl">{duration} <span className="text-sm font-bold text-blue-400">hrs</span></span>
              </div>
              <input 
                type="range" min="1" max="12" value={duration} 
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-slate-400 font-medium mt-2 px-1">
                <span>1 hr</span>
                <span>12 hrs</span>
              </div>
            </div>

            {/* Transport Toggle - Interactive Styling */}
            <div 
              onClick={() => setNeedsTransport(!needsTransport)}
              className={`p-5 rounded-3xl border-2 cursor-pointer transition-all flex justify-between items-center select-none ${needsTransport ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${needsTransport ? 'bg-blue-100 text-blue-600' : 'bg-white text-slate-400 shadow-sm'}`}>
                  <Car size={24} />
                </div>
                <div>
                  <p className={`font-bold text-lg ${needsTransport ? 'text-blue-900' : 'text-slate-700'}`}>Requires Vehicle</p>
                  <p className={`text-sm font-medium ${needsTransport ? 'text-blue-600' : 'text-slate-500'}`}>Caregiver must bring transport</p>
                </div>
              </div>
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${needsTransport ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`}>
                {needsTransport && <span className="text-white text-sm font-black">✓</span>}
              </div>
            </div>

            {/* Price Display & Submit Button */}
            <button 
              onClick={requestRide} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-3xl shadow-lg hover:shadow-blue-500/40 flex justify-between items-center active:scale-95 transition-all mt-4 border border-blue-500"
            >
              <span className="font-bold text-xl tracking-wide">Confirm Request</span>
              <div className="bg-white text-blue-700 px-5 py-2 rounded-2xl font-black text-xl shadow-sm">
                ₹{calculatePrice()}
              </div>
            </button>
          </div>
        )}

        {/* STATE 2 & 3: SEARCHING / BROADCASTING */}
        {status === 'searching' && (
          <div className="text-center py-10 max-w-lg mx-auto animate-fade-in">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h2 className="text-2xl font-black text-slate-800">
              {rideData ? 'Locating nearby assistants...' : 'Generating Secure Request...'}
            </h2>
            <p className="text-slate-500 font-medium mt-2 text-lg">
              {rideData ? 'Please wait while we match you with a trusted caregiver.' : 'Connecting to the secure network.'}
            </p>
          </div>
        )}

        {/* STATE 4: MATCHED - SHOW OTP */}
        {status === 'waiting_for_pickup' && rideData && (
          <div className="max-w-lg mx-auto text-center py-8 bg-gradient-to-b from-emerald-50 to-green-50 rounded-[40px] border border-green-200 shadow-lg animate-fade-in px-6">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-black text-green-900 mb-2">Caregiver Confirmed!</h2>
            <p className="text-green-700 font-medium mb-8 text-lg">Share this secure Start PIN when they arrive.</p>
            
            {/* Huge OTP Display */}
            <div className="text-7xl font-black text-green-700 tracking-[0.25em] bg-white py-8 rounded-[32px] shadow-sm mx-2 border-2 border-green-100 font-mono">
              {rideData.otp}
            </div>
            
            <p className="text-sm text-red-500 mt-8 font-bold flex items-center justify-center gap-2 bg-red-50 py-3 rounded-xl w-max mx-auto px-6">
              <span className="text-xl">⚠️</span> Do not share over the phone.
            </p>
          </div>
        )}

        {/* STATE 5: OTP VERIFIED - RIDE IN PROGRESS */}
        {status === 'in_progress' && (
          <div className="max-w-lg mx-auto text-center py-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] shadow-2xl animate-fade-in text-white border border-blue-500">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
              ✅
            </div>
            <h2 className="text-4xl font-black mb-3 tracking-tight">Verified!</h2>
            <p className="text-blue-100 font-medium text-xl px-8">Your trusted assistance session is now in progress.</p>
          </div>
        )}
      </section>
    </div>
  );
}