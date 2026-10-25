import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

// IMPORTANT: Leaflet styles must be imported for the map to display correctly
import 'leaflet/dist/leaflet.css'; 

const MapComponent = () => {
  // Center coordinates (Latitude, Longitude)
  const position = [6.79535252431408, 79.90471156096326]; 

  return (
    // MapContainer replaces the traditional <div>. You MUST set a height here or in a CSS class.
    <MapContainer 
      center={position} 
      zoom={13} 
      style={{ height: '500px', width: '100%' }}
    >
      {/* The TileLayer provides the actual map images (OpenStreetMap here) */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Add a marker with a popup */}
      <Marker position={position}>
        <Popup>
          Weras Ganga
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapComponent;