import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Initialize outside component to prevent multiple connections
const socket = io('http://localhost:5000', { autoConnect: true });

export default function BookingPage() {
  const [position] = useState([11.0168, 76.9558]); 
  const [status, setStatus] = useState('idle'); 
  const [rideData, setRideData] = useState(null); 
  const [isConnected, setIsConnected] = useState(socket.connected); // LIVE STATUS

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

    socket.on('ride_accepted', (data) => {
      setStatus('waiting_for_pickup');
    });

    socket.on('ride_started', () => {
      setStatus('in_progress');
    });

    // 3. CRITICAL CLEANUP: Kill the ghost operators!
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('ride_booked_success');
      socket.off('ride_accepted');
      socket.off('ride_started');
    };
  }, []);

  const requestRide = () => {
    if (!isConnected) return alert("Cannot book: Server disconnected!");
    setStatus('searching');
    socket.emit('request_ride', { lat: position[0], lng: position[1] });
  };

  return (
    <div className="flex flex-col h-screen w-full relative">
      {/* Live Server Connection Indicator */}
      <div className="absolute top-4 left-4 z-[2000] bg-white px-4 py-2 rounded-full shadow-md flex items-center gap-2 font-bold text-sm">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        {isConnected ? 'Live' : 'Offline'}
      </div>

      <MapContainer center={position} zoom={14} style={{ height: '100%', width: '100%', zIndex: 0 }} zoomControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position}></Marker>
      </MapContainer>

      {/* Smooth transitioning Bottom Sheet */}
      <section className="bg-white rounded-t-3xl shadow-[0_-15px_40px_rgba(0,0,0,0.15)] p-6 absolute bottom-0 w-full z-[1000] transition-all duration-500 ease-in-out">
        {status === 'idle' && (
          <button onClick={requestRide} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-xl shadow-lg transition-transform active:scale-95">
            Find Caregiver
          </button>
        )}

        {status === 'searching' && !rideData && (
          <div className="text-center py-6 animate-pulse">Generating Secure Request...</div>
        )}

        {status === 'searching' && rideData && (
          <div className="text-center py-4 transition-opacity duration-300">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800">Locating nearby assistants...</h2>
          </div>
        )}

        {status === 'waiting_for_pickup' && rideData && (
          <div className="text-center py-6 bg-green-50 rounded-2xl border border-green-200 shadow-inner">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Share this OTP with your Caregiver</h2>
            <div className="text-6xl font-black text-green-700 tracking-[0.2em] bg-white py-4 rounded-xl shadow-sm mx-4 border border-green-100">
              {rideData.otp}
            </div>
            <p className="text-sm text-gray-500 mt-4 font-medium">Do not share until they arrive.</p>
          </div>
        )}

        {status === 'in_progress' && (
          <div className="text-center py-8 bg-blue-50 border border-blue-200 rounded-2xl">
            <h2 className="text-3xl font-black text-blue-700 mb-2">Ride Verified!</h2>
            <p className="text-blue-900 font-medium">You are now en route safely.</p>
          </div>
        )}
      </section>
    </div>
  );
}