import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { Phone, ShieldAlert, Star, MessageSquare } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
L.Marker.prototype.options.icon = L.icon({
    iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41]
});

const RideTracking = () => {
  // Dummy data for the UI. Later we will connect this to Socket.io!
  const [userLocation] = useState({ lat: 11.0168, lng: 77.0150 });
  const [assistantLocation] = useState({ lat: 11.0208, lng: 77.0190 });

  return (
    // The Container restricts the width to look like a mobile phone on desktop
    <div className="relative h-screen w-full max-w-md mx-auto bg-gray-100 overflow-hidden shadow-2xl border-x border-gray-200">
      
      {/* LAYER 1: The Full Screen Map */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={[userLocation.lat, userLocation.lng]} 
          zoom={14} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false} // Hide default zoom buttons for clean UI
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {/* User Pin */}
          <Marker position={[userLocation.lat, userLocation.lng]} />
          {/* Caregiver Pin */}
          <Marker position={[assistantLocation.lat, assistantLocation.lng]} />
        </MapContainer>
      </div>

      {/* TOP BAR: Floating Safety / Status */}
      <div className="absolute top-6 left-0 right-0 z-10 px-4 flex justify-between">
        <div className="bg-white px-4 py-2 rounded-full shadow-md font-bold text-sm text-gray-700 flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
          Arriving in 5 mins
        </div>
        <button className="bg-white p-2 rounded-full shadow-md text-red-600">
          <ShieldAlert size={20} />
        </button>
      </div>

      {/* LAYER 2: The Bottom Sheet (Rapido Style) */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 pb-8">
        
        {/* Drag Handle UI (Visual only) */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-5"></div>

        {/* Caregiver Info */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center border-2 border-rose-500 overflow-hidden">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ramesh" alt="Caregiver" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">Ramesh K.</h3>
              <div className="flex items-center text-sm text-gray-500 font-medium">
                <Star size={14} className="text-yellow-500 fill-yellow-500 mr-1" /> 4.9 • Trained Caregiver
              </div>
            </div>
          </div>
          {/* OTP Box */}
          <div className="bg-gray-100 px-3 py-1 rounded-lg text-center">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">OTP</p>
            <p className="text-xl font-black text-gray-800 tracking-widest">4812</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3.5 rounded-xl font-bold text-lg flex justify-center items-center shadow-md transition-all">
            <Phone size={20} className="mr-2" /> Call
          </button>
          <button className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-3.5 rounded-xl font-bold shadow-sm transition-all border border-rose-100">
            <MessageSquare size={24} />
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default RideTracking;