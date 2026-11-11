import React, { useState, useEffect, useRef } from 'react';
import SensorAreaChart from './components/SensorAreaChart';
import MapComponent, { RIVER_NODES } from './components/MainView';
import SensorCard from './components/SensorCard';
import { API_BASE, statusForDistance, emptyData } from './utils/helpers';
import { styles } from './styles/dashboardStyles';

export default function App() {
  const [data, setData] = useState(emptyData('SURGE_001'));
  const [history, setHistory] = useState([]); 
  const [lastUpdated, setLastUpdated] = useState('Not updated yet');
  const [isOnline, setIsOnline] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [selected, setSelected] = useState(RIVER_NODES[0]);
  const dashRef = useRef(null);

  const scrollToDashboard = () => dashRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const handleSelect = (node) => {
    setSelected(node);
    setTimeout(scrollToDashboard, 1300); 
  };

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/sensor-data?device=${selected.id}`);
        if (response.ok) {
          const json = await response.json();
          if (json && json.readings) {
            setData(json);
            setIsOnline(true);
            setLastUpdated(new Date().toLocaleTimeString());
          } else setIsOnline(false);
        } else setIsOnline(false);
      } catch (err) {
        setIsOnline(false);
      }
    };

    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/history?device=${selected.id}`);
        if (response.ok) {
          const rows = await response.json();
          setHistory(rows);
        }
      } catch (err) {}
    };

    setIsOnline(false);
    setLastUpdated('Not updated yet');
    setHistory([]);
    setData(emptyData(selected.id));

    fetchLiveData();
    fetchHistory();
    

    const interval = setInterval(() => {
      fetchLiveData();
      fetchHistory();
    }, 2000); 
    
    return () => clearInterval(interval);
  }, [selected.id]);

  const avgDistance = data.readings.reduce((sum, r) => sum + r.distance_cm, 0) / (data.readings.length || 1);
  const avgStatus = statusForDistance(avgDistance);

  let trendLabel = null;
  let trendUp = false;

  if (history.length >= 2) {
    const avgOf = (row) => (row.s1 + row.s2 + row.s3 + row.s4) / 4;
    const windowSize = Math.min(3, Math.floor(history.length / 2));
    
    const startAvg = history.slice(0, windowSize).reduce((acc, r) => acc + avgOf(r), 0) / windowSize;
    const endAvg = history.slice(-windowSize).reduce((acc, r) => acc + avgOf(r), 0) / windowSize;

    if (startAvg > 0) {
      const pctChange = ((endAvg - startAvg) / startAvg) * 100;
      trendUp = pctChange >= 0;
      trendLabel = `${trendUp ? 'Rising' : 'Falling'} ${Math.abs(pctChange).toFixed(1)}% over this window`;
    }
  }

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.75); } }
        @keyframes rise { from { transform: scaleY(0); } to { transform: scaleY(1); } }
      `}</style>

      <MapComponent selected={selected} onSelect={handleSelect} onNavClick={scrollToDashboard} />

      <div ref={dashRef} id="dashboard" style={styles.dashboard}>
        <div style={styles.container}>
          <header style={styles.header}>
            <div>
              <div style={styles.eyebrow}>{selected.river} · {selected.place}</div>
              <h1 style={styles.title}>{selected.id}</h1>
            </div>
            <div style={{
              ...styles.statusPill,
              borderColor: isOnline ? 'rgba(45, 212, 191, 0.4)' : 'rgba(248, 113, 113, 0.4)',
              background: isOnline ? 'rgba(45, 212, 191, 0.08)' : 'rgba(248, 113, 113, 0.08)'
            }}>
              <span style={{
                ...styles.statusDot,
                background: isOnline ? '#2dd4bf' : '#f87171',
                animation: isOnline ? 'pulse-dot 1.8s ease-in-out infinite' : 'none'
              }} />
              <span style={{ color: isOnline ? '#5eead4' : '#fca5a5' }}>
                {isOnline ? 'Live' : 'Disconnected'}
              </span>
            </div>
          </header>

          <div style={styles.metaRow}>
            <span>Last reading <strong style={styles.metaValue}>{lastUpdated}</strong></span>
            <span style={styles.metaDivider} />
            <span>
              Average clearance <strong style={{ ...styles.metaValue, color: avgStatus.color }}>{avgDistance.toFixed(1)} cm</strong>
            </span>
          </div>

          <div style={styles.grid}>
            {data.readings.map((sensor) => (
              <SensorCard key={sensor.sensor_id} sensor={sensor} maxDistance={200} />
            ))}
          </div>

          <div style={styles.chartSection}>
            <div style={styles.chartHeader}>
              <div>
                <h3 style={styles.chartTitle}>Distance readings</h3>
                <p style={styles.chartSubtitle}>Last 20 samples · all 4 nodes</p>
              </div>
              {trendLabel && (
                <div style={{ ...styles.trendTag, color: trendUp ? '#fbbf24' : '#5eead4' }}>
                  {trendUp ? '↑' : '↓'} {trendLabel}
                </div>
              )}
            </div>
            <SensorAreaChart data={history} />
          </div>

          <button style={styles.rawToggle} onClick={() => setShowRaw((v) => !v)}>
            {showRaw ? 'Hide raw payload' : 'Show raw payload'}
          </button>

          <button style={{ ...styles.rawToggle, marginLeft: 10 }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            ↑ Back to map
          </button>

          {showRaw && <pre style={styles.jsonPreview}>{JSON.stringify(data, null, 2)}</pre>}
        </div>
      </div>
    </div>
  );
}