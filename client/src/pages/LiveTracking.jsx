import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react'; // Premium icons

// VERCEL FIX: Use the environment variable for production!
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(API_URL, { autoConnect: true });

const LiveTracking = ({ bookingId }) => {
  const [assistantLocation, setAssistantLocation] = useState(null);

  useEffect(() => {
    // 1. Tell the server we want to watch THIS specific booking
    socket.emit('joinBookingRoom', bookingId);

    // 2. Listen for live updates from the backend
    socket.on('liveLocation', (data) => {
      console.log("Got new location:", data);
      setAssistantLocation({ lat: data.lat, lng: data.lng });
    });

    // 3. Cleanup on unmount
    return () => {
      socket.off('liveLocation');
      // REMOVED socket.disconnect() - See "The Traps" below to understand why!
    };
  }, [bookingId]);

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-2xl border border-blue-50 w-full max-w-3xl mx-auto mt-6">
      
      {/* Premium Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-full text-blue-600 animate-pulse shadow-inner">
          <Navigation size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Caregiver is on the way!</h2>
          <p className="text-blue-500 font-bold text-sm tracking-wide uppercase mt-1">Live GPS Tracking</p>
        </div>
      </div>
      
      {/* Map Container */}
      <div className="h-[400px] w-full rounded-3xl overflow-hidden border-4 border-slate-50 shadow-inner relative bg-slate-100">
        
        {/* State 1: We have the coordinates -> Show Map */}
        {assistantLocation ? (
          <MapContainer center={[assistantLocation.lat, assistantLocation.lng]} zoom={16} style={{ height: '100%', width: '100%', zIndex: 0 }} zoomControl={false}>
            {/* Upgraded to the premium 'voyager' map style */}
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
            <Marker position={[assistantLocation.lat, assistantLocation.lng]}>
               <Popup>
                 <div className="font-bold text-blue-800 text-center">Caregiver Location<br/><span className="text-xs text-slate-500">Updated Live</span></div>
               </Popup>
            </Marker>
          </MapContainer>
        ) : (
          <>
            {/* State 2: Waiting for GPS -> Show Premium Skeleton/Loader */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-md z-10">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapPin size={24} className="text-blue-600 animate-bounce" />
                </div>
              </div>
              <p className="text-slate-800 font-black text-xl mb-1">Connecting to Caregiver's GPS...</p>
              <p className="text-slate-500 font-medium">Please wait while we establish a secure connection.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LiveTracking;