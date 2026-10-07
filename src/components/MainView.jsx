import React from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../index.css'; 

// Import your downloaded rivers data 
import riversData from '../sri_lanka_rivers.json';

// Helper to create glowing DivIcons with different colors dynamically
const createGlowingIcon = (label, color) => {
  return new L.DivIcon({
    html: `
      <div class="custom-marker-wrapper">
        <div class="pulse-ring ${color}"></div>
        <div class="marker-dot ${color}"></div>
        <div class="marker-label" style="color: black !important; text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;">
          ${label}
        </div>
      </div>
    `,
    className: '', 
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Define exactly 10 coordinates along major Sri Lankan rivers
const riverNodes = [
  // RED NODES (2)
  { id: '1', name: 'Node M_04', pos: [7.9100, 81.0850], river: 'Mahaweli River (Polonnaruwa)', color: 'red' },
  { id: '2', name: 'Node K_02', pos: [6.9904, 80.4137], river: 'Kelani River (Kitulgala)', color: 'red' },

  // GREEN NODES (8)
  { id: '3', name: 'Node M_01', pos: [7.2906, 80.6337], river: 'Mahaweli River (Kandy)', color: 'green' },
  { id: '4', name: 'Node K_01', pos: [6.9271, 79.8612], river: 'Kelani River (Kaduwela)', color: 'green' },
  { id: '5', name: 'Node KA_01', pos: [6.6828, 80.3992], river: 'Kalu Ganga (Ratnapura)', color: 'green' },
  { id: '6', name: 'Node KA_02', pos: [6.5815, 79.9607], river: 'Kalu Ganga (Kalutara)', color: 'green' },
  { id: '7', name: 'Node W_01', pos: [6.1245, 81.0182], river: 'Walawe River (Ambalantota)', color: 'green' },
  { id: '8', name: 'Node MAL_01', pos: [8.3114, 80.4037], river: 'Malvathu Oya (Anuradhapura)', color: 'green' },
  { id: '9', name: 'Node G_01', pos: [6.1481, 80.2033], river: 'Gin Ganga (Wakwella)', color: 'green' },
  { id: '10', name: 'Node MAD_01', pos: [7.6436, 81.2185], river: 'Maduru Oya (Welikada)', color: 'green' },
];

export default function SriLankaRiversMap() {
  
  // Filter to remove point marker geometries & include only main rivers
  const filterMainRivers = (feature) => {
    const isLine = feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString';
    const isRiver = feature.properties && feature.properties.waterway === 'river';
    return isLine && isRiver;
  };

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <MapContainer 
        center={[7.8731, 80.7718]} 
        zoom={8} 
        style={{ height: '100%', width: '100%' }}
      >
        {/* standard tiles under Custom App.css light filters */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />

        {/* Rivers highlight Overlay without Point features */}
        <GeoJSON 
          data={riversData} 
          style={{ color: '#00d4ff', weight: 2, opacity: 0.8 }} 
          filter={filterMainRivers}
          pointToLayer={() => null} // Prevent default pins for original points
        />

        {/* Render our 10 specified red & green glowing beacons */}
        {riverNodes.map((node) => (
          <Marker 
            key={node.id} 
            position={node.pos} 
            icon={createGlowingIcon(node.name, node.color)}
          >
            <Popup>
              <strong>{node.name}</strong><br />
              Location: {node.river}<br />
              Status: {node.color === 'red' ? '⚠️ Alert Status' : '✅ Active Status'}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}