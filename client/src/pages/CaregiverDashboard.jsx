import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { MapPin, Car, User, Clock, CheckCircle2 } from 'lucide-react'; // Added icons for premium UI

// VERCEL FIX: Use the environment variable so it connects to Render!
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(API_URL, { autoConnect: true });

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
    
    socket.on('otp_result', (res) => {
      if (res.success) {
        setRideStarted(true);
      } else {
        alert(res.message); 
        setEnteredOtp(''); 
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
    if (enteredOtp.length !== 4) {
      return alert("OTP must be exactly 4 digits.");
    }
    socket.emit('verify_otp', { 
      bookingId: activeRide.bookingId, 
      enteredOtp: String(enteredOtp).trim() 
    });
  };

  return (
    // Replaced generic gray with subtle premium gradient
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen font-sans text-slate-900 relative">
      
      <div className="max-w-md mx-auto">
        {/* Header with Live Connection Status */}
        <header className="flex justify-between items-center mb-8 bg-white/80 backdrop-blur-md p-5 rounded-3xl shadow-sm border border-white">
          <h1 className="text-2xl font-black tracking-tight text-blue-800 flex items-center">
            CareCaptain <span className="text-blue-400 font-bold ml-2 text-sm bg-blue-50 px-2 py-1 rounded-lg">PRO</span>
          </h1>
          <div className="flex items-center gap-2">
            <div className="relative flex h-3 w-3">
              {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </div>
            <span className="text-xs font-bold text-slate-600 tracking-wider">
              {isConnected ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </header>

        {/* STATE 1: IDLE / SCANNING */}
        {!incomingRide && !activeRide && (
           <div className="bg-white/60 backdrop-blur-sm border-2 border-dashed border-blue-200 p-12 rounded-[2rem] text-center mt-12 shadow-sm animate-fade-in">
             <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
               <div className="absolute inset-0 border-4 border-blue-400 rounded-full animate-ping opacity-20"></div>
               <span className="text-4xl text-blue-600"><MapPin size={40} /></span>
             </div>
             <h2 className="text-2xl font-black text-slate-800 mb-2">Scanning Zone...</h2>
             <p className="text-slate-500 font-medium text-lg">Waiting for nearby care requests.</p>
           </div>
        )}

        {/* STATE 2: NEW REQUEST POPUP (Hydrated Payload UI) */}
        {incomingRide && (
          <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-fade-in border border-blue-100 mt-4 transform transition-all hover:scale-[1.02]">
            
            {/* Price & Duration Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white flex justify-between items-center shadow-inner">
              <div>
                <h3 className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span> New Request
                </h3>
                <p className="text-4xl font-black text-white drop-shadow-md">₹{incomingRide.estimatedPrice}</p>
              </div>
              <div className="text-right bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-sm border border-white/20">
                <p className="font-black text-2xl flex items-center justify-end">
                  {incomingRide.durationHours} <Clock size={20} className="ml-2 text-blue-300" />
                </p>
                <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mt-1">Duration</p>
              </div>
            </div>
            
            {/* Preferences & Actions Body */}
            <div className="p-6 bg-white">
              <div className={`flex items-center gap-4 mb-8 p-4 rounded-2xl border ${incomingRide.requiresTransport ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                <div className={`p-3 rounded-xl ${incomingRide.requiresTransport ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
                  {incomingRide.requiresTransport ? <Car size={28} /> : <User size={28} />}
                </div>
                <div>
                  <p className={`font-bold text-lg ${incomingRide.requiresTransport ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {incomingRide.requiresTransport ? 'Vehicle Required' : 'Standard Care'}
                  </p>
                  <p className={`text-sm font-medium ${incomingRide.requiresTransport ? 'text-indigo-600' : 'text-slate-500'}`}>
                    {incomingRide.requiresTransport ? 'Ensure you have transport' : 'In-home assistance'}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setIncomingRide(null)} 
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg py-4 rounded-2xl transition-colors active:scale-95"
                >
                  Decline
                </button>
                <button 
                  onClick={acceptRide} 
                  className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black text-xl py-4 rounded-2xl shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-all active:scale-95 border border-blue-500"
                >
                  ACCEPT JOB
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STATE 3: ARRIVED - OTP VERIFICATION PHASE */}
        {activeRide && !rideStarted && (
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl mt-4 border-2 border-amber-300 animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300"></div>
            
            <div className="text-center">
              <h3 className="text-3xl font-black text-slate-800 mb-2">You have arrived!</h3>
              <p className="text-slate-500 mb-8 text-base font-medium">Ask the user for their secure 4-digit PIN to officially start.</p>
              
              <input 
                type="number" 
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                placeholder="• • • •"
                maxLength={4}
                className="w-full bg-slate-50 border-2 border-slate-200 text-center text-5xl font-mono font-black py-6 rounded-3xl mb-6 tracking-[0.4em] outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all text-slate-800 placeholder-slate-300"
              />
              <button 
                onClick={submitOtp} 
                className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl text-xl hover:bg-black transition-transform active:scale-95 flex justify-center items-center gap-3"
              >
                Verify & Start <CheckCircle2 size={24} />
              </button>
            </div>
          </div>
        )}

        {/* STATE 4: RIDE IN PROGRESS */}
        {rideStarted && (
          <div className="bg-gradient-to-b from-emerald-500 to-green-600 p-10 rounded-[2rem] shadow-[0_20px_50px_rgba(34,197,94,0.4)] mt-4 text-center animate-fade-in border border-green-400">
            <div className="w-28 h-28 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-white/30">
              <CheckCircle2 size={64} className="text-white" />
            </div>
            <h3 className="text-4xl font-black text-white mb-3 tracking-tight">Job Started!</h3>
            <p className="text-green-100 font-medium text-xl">Provide excellent, compassionate care.</p>
          </div>
        )}
      </div>
    </div>
  );
}