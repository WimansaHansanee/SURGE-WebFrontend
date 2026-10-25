import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

// IMPORTANT: Leaflet styles must be imported for the map to display correctly
import 'leaflet/dist/leaflet.css'; 

const MapComponent = () => {
  // Center coordinates (Latitude, Longitude)
  const position = [6.780080643860063, 80.51566297725896];

  const surge_positions = [
  {
    id: "001",
    river: "Weras Ganga",
    pos: [6.79535252431408, 79.90471156096326],
    loc: "Weras Ganga, Moratuwa"
  },
  {
    id: "002",
    river: "Kelani Ganga",
    pos: [6.90994856438638, 80.08347200039616],
    loc: "Kelani Ganga, Hanwella"
  },
  {
    id: "003",
    river: "Kalu Ganga",
    pos: [6.679146729104006, 80.39742232046343],
    loc: "Kalu Ganga, Ratnapura"
  },
  {
    id: "004",
    river: "Nilwala Ganga",
    pos: [6.100484016365231, 80.47883993546981],
    loc: "Nilwala Ganga, Panadugama"
  },
  {
    id: "005",
    river: "Gin Ganga",
    pos: [6.1860593619469615, 80.19236455162523],
    loc: "Gin Ganga, Baddegama"
  },
  {
    id: "006",
    river: "Mahaweli Ganga",
    pos: [7.272203515234754, 80.60442466064512],
    loc: "Mahaweli Ganga, Peradeniya"
  },
  {
    id: "007",
    river: "Maha Oya",
    pos: [7.301677764991613, 79.98360121909742],
    loc: "Maha Oya, Badalgama"
  }
];

  return (
    // MapContainer replaces the traditional <div>. You MUST set a height here or in a CSS class.
    <MapContainer 
      center={position} 
      zoom={8} 
      style={{ height: '500px', width: '100%' }}
    >
      {/* The TileLayer provides the actual map images (OpenStreetMap here) */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {surge_positions.map((item) => (
        <Marker key={item.id} position={item.pos}>
          <Popup>
            <div>
              <strong>{item.river}</strong>
              <br />
              {item.loc}
            </div>
          </Popup>
        </Marker>
      ))}

      

    </MapContainer>
  );
};

export default MapComponent;