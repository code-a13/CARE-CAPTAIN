import { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // CRITICAL: Map breaks without this!
import L from 'leaflet';

// Fix for Leaflet's default icon missing issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to smoothly move the map camera
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

const MapWidget = ({ onLocationSelect }) => {
  // Default to Coimbatore coordinates
  const [position, setPosition] = useState({ lat: 11.0168, lng: 77.0150 });
  const markerRef = useRef(null);

  // Get user's GPS location on load
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        onLocationSelect({ longitude, latitude });
      });
    }
  }, []);

  // Handle dragging the pin
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition({ lat: newPos.lat, lng: newPos.lng });
          // Send back to parent in [longitude, latitude] format for MongoDB
          onLocationSelect({ longitude: newPos.lng, latitude: newPos.lat });
        }
      },
    }),
    [onLocationSelect]
  );

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', zIndex: 1 }}>
      <MapContainer 
        center={[position.lat, position.lng]} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
      >
        <ChangeView center={[position.lat, position.lng]} zoom={14} />
        
        {/* The free OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker
          draggable={true}
          eventHandlers={eventHandlers}
          position={[position.lat, position.lng]}
          ref={markerRef}
        />
      </MapContainer>
    </div>
  );
};

export default MapWidget;