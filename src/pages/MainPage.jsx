import React from 'react';
import MainView from '../components/MainView';
import { useNavigate } from 'react-router-dom';

export default function MainPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.pageContainer}>
      {/* 
        Global Styles injected here for the animations and 
        to override Leaflet's default white popups.
      */}
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; overflow: hidden; background: #000; font-family: 'Space Grotesk', sans-serif; }
        
        /* Marker Animations */
        .custom-marker-wrapper { position: relative; display: flex; justify-content: center; align-items: center; width: 24px; height: 24px; }
        .pulse-ring { position: absolute; width: 60px; height: 60px; background: rgba(34, 211, 238, 0.3); border: 1px solid #22d3ee; border-radius: 50%; animation: pulse 2s ease-out infinite; }
        .marker-dot { width: 16px; height: 16px; background: #22d3ee; border: 2px solid #fff; border-radius: 50%; z-index: 10; box-shadow: 0 0 10px #22d3ee; }
        .marker-label { position: absolute; top: 35px; color: #a5f3fc; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 500; white-space: nowrap; text-shadow: 0px 2px 4px rgba(0,0,0,0.8); }
        
        @keyframes pulse {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        /* Leaflet Popup Dark Mode Overrides */
        .leaflet-popup-content-wrapper, .leaflet-popup-tip { background: #0c1f24 !important; border: 1px solid #1e3a40; box-shadow: 0 10px 25px rgba(0,0,0,0.8); }
        .leaflet-popup-content { margin: 12px 14px; }
        .popup-content-inner { display: flex; flex-direction: column; gap: 8px; font-family: 'Space Grotesk', sans-serif; }
        .popup-title { color: #eef7f5; font-size: 13px; font-weight: 700; font-family: 'JetBrains Mono', monospace; letter-spacing: -0.5px; }
        .popup-sub { color: #8fb4ba; font-size: 12px; }
        .popup-btn { background: transparent; border: none; color: #2dd4bf; text-align: left; font-size: 13px; font-weight: 600; cursor: pointer; padding-top: 6px; }
        .popup-btn:hover { color: #5eead4; text-decoration: underline; }
        .leaflet-popup-close-button { color: #8fb4ba !important; }

        /* INJECT THE DARK MODE FILTER HERE */
        .dark-map-tiles {
          filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
        }y
      `}</style>

      {/* Map Layer (z-index 1) */}
      <MainView />

      {/* UI Overlay Layer (z-index 1000 to sit above Leaflet) */}
      <div style={styles.overlay}>
        
        {/* Left Info Panel */}
        <div style={styles.leftPanel}>
          <h1 style={styles.logo}>SURGE</h1>
          
          <div style={styles.statusRow}>
            <span style={styles.subtitle}>RIVER MONITORING SYSTEM</span>
            <div style={styles.onlineTag}>
              <span style={styles.onlineDot}></span> ONLINE
            </div>
          </div>
          
          <p style={styles.description}>
            Real-time riverbank clearance & flood early warning networks. 
            Select a node on the map to inspect live sensor telemetry.
          </p>

          <div style={styles.statsGrid}>
            <div>
              <div style={styles.statValue}>1</div>
              <div style={styles.statLabel}>Active Node</div>
            </div>
            <div>
              <div style={styles.statValue}>Normal</div>
              <div style={styles.statLabel}>Water Levels</div>
            </div>
          </div>
        </div>

        {/* Top Right Navigation */}
        <div style={styles.topNav}>
          <button style={styles.navButton}>Map View</button>
          <button style={styles.navButton}>System Health</button>
          <button style={styles.navButton}>Documentation</button>
          <button 
            style={{...styles.navButton, ...styles.navButtonActive}}
            onClick={() => navigate('/dashboard')}
          >
            Live Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none', // Let clicks pass through to the map...
    zIndex: 1000,
  },
  leftPanel: {
    pointerEvents: 'auto', // ...but catch clicks on the UI panels
    position: 'absolute',
    top: '30px',
    left: '30px',
    width: '360px',
    background: 'rgba(10, 26, 31, 0.75)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(45, 212, 191, 0.2)',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
  },
  logo: {
    color: '#a5f3fc',
    fontSize: '48px',
    fontWeight: 900,
    fontFamily: "'Space Grotesk', sans-serif",
    margin: '0 0 10px 0',
    letterSpacing: '-2px',
    textShadow: '0 0 15px rgba(165, 243, 252, 0.4)',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    borderBottom: '1px solid rgba(45, 212, 191, 0.2)',
    paddingBottom: '20px',
  },
  subtitle: {
    color: '#8fb4ba',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '1px',
  },
  onlineTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#2dd4bf',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1px',
    background: 'rgba(45, 212, 191, 0.1)',
    padding: '4px 8px',
    borderRadius: '999px',
  },
  onlineDot: {
    width: '6px',
    height: '6px',
    background: '#2dd4bf',
    borderRadius: '50%',
    boxShadow: '0 0 8px #2dd4bf',
  },
  description: {
    color: '#d7ece8',
    fontSize: '14px',
    lineHeight: '1.6',
    marginBottom: '30px',
  },
  statsGrid: {
    display: 'flex',
    gap: '40px',
  },
  statValue: {
    color: '#fff',
    fontSize: '28px',
    fontWeight: 500,
    fontFamily: "'Space Grotesk', sans-serif",
    marginBottom: '4px',
  },
  statLabel: {
    color: '#8fb4ba',
    fontSize: '13px',
  },
  topNav: {
    pointerEvents: 'auto',
    position: 'absolute',
    top: '30px',
    right: '30px',
    display: 'flex',
    gap: '8px',
    background: 'rgba(10, 26, 31, 0.65)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(45, 212, 191, 0.2)',
    borderRadius: '999px',
    padding: '6px',
  },
  navButton: {
    background: 'transparent',
    border: 'none',
    color: '#8fb4ba',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    borderRadius: '999px',
    transition: 'all 0.2s',
  },
  navButtonActive: {
    background: 'rgba(45, 212, 191, 0.15)',
    color: '#2dd4bf',
    border: '1px solid rgba(45, 212, 191, 0.3)',
  }
};