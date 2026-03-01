// client/src/pages/CaregiverDashboard.jsx
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Initialize outside component to prevent multiple connections on re-render
const socket = io('http://localhost:5000', { autoConnect: true });

export default function CaregiverDashboard() {
  const [incomingRide, setIncomingRide] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [rideStarted, setRideStarted] = useState(false);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    // 1. Connection Trackers
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    // 2. Listen for newly broadcasted rides (Contains the hydrated pricing data)
    socket.on('new_ride_available', (data) => {
      console.log("Caregiver heard new ride:", data);
      setIncomingRide(data);
    });
    
    // 3. Listen for backend validation of the OTP
    socket.on('otp_result', (res) => {
      if (res.success) {
        setRideStarted(true);
      } else {
        alert(res.message); // e.g., "Invalid OTP"
        setEnteredOtp(''); // Clear the input field automatically on fail
      }
    });

    // 4. Cleanup listeners to prevent memory leaks
    return () => {
      socket.off('connect'); 
      socket.off('disconnect'); 
      socket.off('new_ride_available'); 
      socket.off('otp_result');
    };
  }, []);

  const acceptRide = () => {
    // Tell the backend (and the elderly user) that we are coming
    socket.emit('accept_ride', { bookingId: incomingRide.bookingId });
    // Move the ride from "incoming" to "active"
    setActiveRide(incomingRide);
    setIncomingRide(null);
  };

  const submitOtp = () => {
    if (enteredOtp.length !== 4) {
      return alert("OTP must be exactly 4 digits.");
    }
    // Send the typed OTP to the backend to check against its secure memory
    socket.emit('verify_otp', { 
      bookingId: activeRide.bookingId, 
      enteredOtp: String(enteredOtp).trim() 
    });
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen font-sans text-gray-900 relative max-w-md mx-auto shadow-2xl">
      
      {/* Header with Live Connection Status */}
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm">
        <h1 className="text-xl font-black tracking-tight text-blue-700">
          CareCaptain <span className="text-gray-400 font-medium">Provider</span>
        </h1>
        <div className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm transition-colors ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}>
          {isConnected ? 'ONLINE' : 'OFFLINE'}
        </div>
      </header>

      {/* STATE 1: IDLE / SCANNING */}
      {!incomingRide && !activeRide && (
         <div className="bg-white/50 backdrop-blur border border-dashed border-gray-300 p-12 rounded-[2rem] text-center mt-12">
           <div className="w-20 h-20 bg-blue-100/50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
             <span className="text-3xl">📡</span>
           </div>
           <p className="text-gray-500 font-bold text-lg">Scanning your zone...</p>
         </div>
      )}

      {/* STATE 2: NEW REQUEST POPUP (Hydrated Payload UI) */}
      {incomingRide && (
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in border border-gray-100 mt-4">
          
          {/* Price & Duration Header */}
          <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-1">New Request</h3>
              <p className="text-3xl font-black text-green-400">₹{incomingRide.estimatedPrice}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-xl">{incomingRide.durationHours} <span className="text-sm font-medium text-gray-400">Hours</span></p>
            </div>
          </div>
          
          {/* Preferences & Actions Body */}
          <div className="p-6 bg-white">
            <div className="flex items-center gap-4 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <span className="text-3xl">{incomingRide.requiresTransport ? '🚗' : '🚶'}</span>
              <div>
                <p className="font-bold text-gray-900">{incomingRide.requiresTransport ? 'Vehicle Required' : 'Standard Care'}</p>
                <p className="text-xs text-gray-500 font-medium">Check your vehicle availability</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setIncomingRide(null)} 
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-2xl transition-colors"
              >
                Decline
              </button>
              <button 
                onClick={acceptRide} 
                className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 transition-transform active:scale-95"
              >
                ACCEPT JOB
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATE 3: ARRIVED - OTP VERIFICATION PHASE */}
      {activeRide && !rideStarted && (
        <div className="bg-white p-6 rounded-3xl shadow-xl mt-4 border-2 border-yellow-400 animate-fade-in">
          <h3 className="text-2xl font-black text-gray-900 mb-1">You have arrived!</h3>
          <p className="text-gray-500 mb-6 text-sm font-medium">Ask the user for their 4-digit start PIN to officially begin the job.</p>
          
          <input 
            type="number" 
            value={enteredOtp}
            onChange={(e) => setEnteredOtp(e.target.value)}
            placeholder="0 0 0 0"
            maxLength={4}
            className="w-full bg-gray-50 border border-gray-200 text-center text-4xl font-black py-5 rounded-2xl mb-4 tracking-[0.3em] outline-none focus:ring-4 focus:ring-yellow-200 transition-all text-gray-800"
          />
          <button 
            onClick={submitOtp} 
            className="w-full bg-gray-900 text-white font-black py-5 rounded-2xl shadow-lg text-lg hover:bg-black transition-transform active:scale-95"
          >
            Verify & Start Job
          </button>
        </div>
      )}

      {/* STATE 4: RIDE IN PROGRESS */}
      {rideStarted && (
        <div className="bg-green-500 p-8 rounded-3xl shadow-[0_15px_40px_rgba(34,197,94,0.4)] mt-4 text-center animate-fade-in border border-green-400">
          <div className="text-6xl mb-4 bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-inner">
            ✅
          </div>
          <h3 className="text-3xl font-black text-white mb-2">Job Started!</h3>
          <p className="text-green-100 font-bold text-lg">Provide excellent care.</p>
        </div>
      )}
    </div>
  );
}