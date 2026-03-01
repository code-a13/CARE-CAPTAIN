import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', { autoConnect: true });

export default function CaregiverDashboard() {
  const [incomingRide, setIncomingRide] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [rideStarted, setRideStarted] = useState(false);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('new_ride_available', (data) => {
      console.log("Caregiver heard new ride:", data);
      setIncomingRide(data);
    });

    socket.on('otp_result', (response) => {
      if (response.success) {
        setRideStarted(true);
      } else {
        alert(response.message); // Will pop up if wrong
        setEnteredOtp(''); // Clear the boxes on fail
      }
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('new_ride_available');
      socket.off('otp_result');
    };
  }, []);

  const acceptRide = () => {
    socket.emit('accept_ride', { bookingId: incomingRide.bookingId });
    setActiveRide(incomingRide);
    setIncomingRide(null);
  };

  const submitOtp = () => {
    if (enteredOtp.length !== 4) return alert("OTP must be 4 digits");
    // Ensure we are sending clean strings to the backend for comparison
    socket.emit('verify_otp', { 
      bookingId: activeRide.bookingId, 
      enteredOtp: String(enteredOtp).trim() 
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative max-w-md mx-auto shadow-2xl">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-blue-600">Caregiver Mode</h1>
        <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}>
          {isConnected ? 'ONLINE' : 'OFFLINE'}
        </div>
      </header>

      {!incomingRide && !activeRide && (
         <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-100 mt-20">
           <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">📡</div>
           <p className="text-gray-500 font-medium">Waiting for requests...</p>
         </div>
      )}

      {/* NEW REQUEST POPUP */}
      {incomingRide && (
        <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-2xl mt-4 animate-fade-in">
          <h3 className="text-2xl font-black mb-1">New Request!</h3>
          <p className="text-blue-100 mb-6">Someone nearby needs assistance.</p>
          <button onClick={acceptRide} className="w-full bg-white text-blue-700 font-black py-4 rounded-xl shadow-md hover:bg-gray-50 transition-colors">
            ACCEPT RIDE
          </button>
        </div>
      )}

      {/* ARRIVED - OTP VERIFICATION PHASE */}
      {activeRide && !rideStarted && (
        <div className="bg-white p-6 rounded-2xl shadow-xl mt-4 border-2 border-yellow-400 animate-fade-in">
          <h3 className="text-xl font-bold text-gray-800 mb-1">You have arrived!</h3>
          <p className="text-gray-500 mb-6 text-sm font-medium">Ask the user for their 4-digit start PIN.</p>
          
          <input 
            type="number" 
            value={enteredOtp}
            onChange={(e) => setEnteredOtp(e.target.value)}
            placeholder="0 0 0 0"
            maxLength={4}
            className="w-full bg-gray-100 text-center text-4xl font-black py-4 rounded-xl mb-4 tracking-[0.3em] outline-none focus:ring-4 focus:ring-yellow-200 transition-all"
          />
          <button onClick={submitOtp} className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg text-lg hover:bg-gray-800">
            Verify & Start
          </button>
        </div>
      )}

      {/* RIDE IN PROGRESS */}
      {rideStarted && (
        <div className="bg-green-500 p-8 rounded-2xl shadow-xl mt-4 text-center animate-fade-in">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-2xl font-black text-white mb-2">Ride Verified!</h3>
          <p className="text-green-100 font-medium">Head to the destination safely.</p>
        </div>
      )}
    </div>
  );
}