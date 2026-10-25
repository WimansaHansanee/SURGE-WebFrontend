import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './map.css';

// Monitoring nodes placed on Sri Lanka's main flood-prone rivers.
// Coordinates are approximate (town/bridge level), so adjust them to your real sensor sites.
// status: 'ok' (green) | 'alert' (red). Later, derive this from live data.
export const RIVER_NODES = [
  { id: 'SURGE-001', label: 'W_01', river: 'Weras Ganga', place: 'Moratuwa', lat: 6.7954, lng: 79.9047, status: 'ok' },
  { id: 'SURGE-002', label: 'K_02', river: 'Kelani Ganga', place: 'Hanwella', lat: 6.9099, lng: 80.0835, status: 'alert' },
  { id: 'SURGE-003', label: 'KA_01', river: 'Kalu Ganga', place: 'Ratnapura', lat: 6.6791, lng: 80.3974, status: 'alert' },
  { id: 'SURGE-004', label: 'N_01', river: 'Nilwala Ganga', place: 'Panadugama', lat: 6.1005, lng: 80.4788, status: 'ok' },
  { id: 'SURGE-005', label: 'G_01', river: 'Gin Ganga', place: 'Baddegama', lat: 6.1861, lng: 80.1924, status: 'ok' },
  { id: 'SURGE-006', label: 'M_01', river: 'Mahaweli Ganga', place: 'Peradeniya', lat: 7.2722, lng: 80.6044, status: 'ok' },
  { id: 'SURGE-007', label: 'MO_01', river: 'Maha Oya', place: 'Badalgama', lat: 7.3017, lng: 79.9836, status: 'ok' },
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

// Normal scroll -> scrolls the page.
// Touchpad pinch / Ctrl + scroll -> zooms the map.
function PinchZoomOnly() {
  const map = useMap();

  useEffect(() => {
    const el = map.getContainer();

    const onWheel = (e) => {
      if (!e.ctrlKey) return; // plain scroll: do nothing, the page scrolls
      e.preventDefault(); // stop the browser zooming the whole page
      const delta = Math.max(-1, Math.min(1, -e.deltaY * 0.02));
      map.setZoomAround(
        map.mouseEventToContainerPoint(e),
        map.getZoom() + delta,
        { animate: false }
      );
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [map]);

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
          <div>
            <strong>{RIVER_NODES.length}</strong>
            <span>Active Nodes</span>
          </div>
          <div>
            <strong>{alerts ? `${alerts} Alert${alerts > 1 ? 's' : ''}` : 'Normal'}</strong>
            <span>Water Levels</span>
          </div>
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
        scrollWheelZoom={false}
        zoomSnap={0}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        <FlyToNode node={selected} />
        <PinchZoomOnly />

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