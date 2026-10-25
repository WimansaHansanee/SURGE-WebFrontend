import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './map.css';

// Monitoring nodes placed on Sri Lanka's main flood-prone rivers.
// Coordinates are approximate (town/bridge level), so adjust them to your real sensor sites.
// status: 'ok' (green) | 'alert' (red). Later, derive this from live data.
export const RIVER_NODES = [
  { id: 'SURGE_001', label: 'N_01',  river: 'Nilwala Ganga',  place: 'Matara',       lat: 5.9549, lng: 80.5550, status: 'ok' },
  { id: 'SURGE_002', label: 'K_02',  river: 'Kelani Ganga',   place: 'Hanwella',     lat: 6.9094, lng: 80.0836, status: 'alert' },
  { id: 'SURGE_003', label: 'K_03',  river: 'Kelani Ganga',   place: 'Kitulgala',    lat: 6.9890, lng: 80.4170, status: 'ok' },
  { id: 'SURGE_004', label: 'KA_01', river: 'Kalu Ganga',     place: 'Ratnapura',    lat: 6.6828, lng: 80.3992, status: 'alert' },
  { id: 'SURGE_005', label: 'KA_02', river: 'Kalu Ganga',     place: 'Kalutara',     lat: 6.5854, lng: 79.9607, status: 'ok' },
  { id: 'SURGE_006', label: 'G_01',  river: 'Gin Ganga',      place: 'Baddegama',    lat: 6.1761, lng: 80.1964, status: 'ok' },
  { id: 'SURGE_007', label: 'K_01',  river: 'Kelani Ganga',   place: 'Kaduwela',     lat: 6.9366, lng: 79.9856, status: 'ok' },
  { id: 'SURGE_008', label: 'M_01',  river: 'Mahaweli Ganga', place: 'Peradeniya',   lat: 7.2650, lng: 80.5950, status: 'ok' },
  { id: 'SURGE_009', label: 'M_02',  river: 'Mahaweli Ganga', place: 'Manampitiya',  lat: 7.9000, lng: 81.0000, status: 'ok' },
  { id: 'SURGE_010', label: 'W_01',  river: 'Walawe Ganga',   place: 'Embilipitiya', lat: 6.3333, lng: 80.8500, status: 'ok' },
];

const makeIcon = (status, selected) =>
  L.divIcon({
    className: 'surge-marker-wrap',
    html: `<div class="surge-marker ${status} ${selected ? 'selected' : ''}">
             <span class="pulse"></span><span class="dot"></span>
           </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

// Smoothly flies to the selected node
function FlyToNode({ node }) {
  const map = useMap();
  useEffect(() => {
    if (node) map.flyTo([node.lat, node.lng], 10, { duration: 1.2 });
  }, [node, map]);
  return null;
}

export default function MapComponent({ selected, onSelect, onNavClick }) {
  const alerts = RIVER_NODES.filter((n) => n.status === 'alert').length;

  const icons = useMemo(() => {
    const m = {};
    RIVER_NODES.forEach((n) => {
      m[n.id] = makeIcon(n.status, selected?.id === n.id);
    });
    return m;
  }, [selected]);

  return (
    <section className="map-hero">
      {/* Info panel */}
      <aside className="glass-panel">
        <h1>SURGE</h1>
        <div className="glass-sub">
          RIVER MONITORING SYSTEM <span className="pill-online">ONLINE</span>
        </div>
        <p className="glass-desc">
          Real-time riverbank clearance &amp; flood early warning networks. Select a node on
          the map to inspect live sensor telemetry.
        </p>
        <div className="glass-stats">
          <div><strong>{RIVER_NODES.length}</strong><span>Active Nodes</span></div>
          <div><strong>{alerts ? `${alerts} Alert${alerts > 1 ? 's' : ''}` : 'Normal'}</strong><span>Water Levels</span></div>
        </div>
      </aside>

      {/* Top-right nav */}
      <nav className="glass-nav">
        <button className="active">Map View</button>
        <button onClick={() => onNavClick?.('dashboard')}>Live Dashboard</button>
      </nav>

      <MapContainer
        center={[7.5, 80.7]}
        zoom={8}
        zoomControl={false}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        <FlyToNode node={selected} />

        {RIVER_NODES.map((node) => (
          <Marker
            key={node.id}
            position={[node.lat, node.lng]}
            icon={icons[node.id]}
            eventHandlers={{ click: () => onSelect(node) }}
          >
            <Tooltip permanent direction="bottom" offset={[0, 14]} className="surge-label">
              Node {node.label}
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </section>
  );
}