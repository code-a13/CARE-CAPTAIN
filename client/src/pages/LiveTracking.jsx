import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';

// Connect to our backend socket server
const socket = io('http://localhost:5000');

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

    // 3. Cleanup on unmount (CRITICAL TRAP FIX)
    return () => {
      socket.off('liveLocation');
      socket.disconnect();
    };
  }, [bookingId]);

  return (
    <div className="p-4 h-96">
      <h2 className="text-xl font-bold text-rose-600 mb-2">Caregiver is on the way! 🚐</h2>
      
      {/* If we have the location, show it on the map */}
      {assistantLocation ? (
        <MapContainer center={[assistantLocation.lat, assistantLocation.lng]} zoom={16} style={{ height: '100%', width: '100%', borderRadius: '12px' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[assistantLocation.lat, assistantLocation.lng]} />
        </MapContainer>
      ) : (
        <p>Waiting for caregiver's GPS signal...</p>
      )}
    </div>
  );
};

export default LiveTracking;