import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

const MapComponent = () => {
  const position = [51.505, -0.09]; 
  const navigate = useNavigate(); // Initialize the navigation hook

  return (
    <MapContainer 
      center={position} 
      zoom={13} 
      style={{ height: '100vh', width: '100%' }} // Adjusted to 100vh to fill the front page
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Add click handler to the Marker */}
      <Marker 
        position={position}
        eventHandlers={{
          click: () => {
            // Redirect to the dashboard route when clicked
            navigate('/dashboard'); 
          },
        }}
      >
        <Popup>
          Click me to view the monitoring dashboard.
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapComponent;