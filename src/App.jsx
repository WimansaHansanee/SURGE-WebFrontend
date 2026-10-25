import React, { useState, useEffect, useRef } from 'react';
import SensorAreaChart from './components/SensorAreaChart';
import MapComponent, { RIVER_NODES } from './components/MainView';

// Point this at wherever your Express server actually runs.
const API_BASE = 'http://localhost:3000';

// Clearance thresholds (cm). Tune these to your actual riverbank geometry.
const THRESHOLDS = { danger: 15, watch: 25 };

function statusForDistance(cm) {
  if (cm <= THRESHOLDS.danger) return { key: 'danger', label: 'Low clearance', color: '#f87171' };
  if (cm <= THRESHOLDS.watch) return { key: 'watch', label: 'Watch', color: '#fbbf24' };
  return { key: 'safe', label: 'Clear', color: '#2dd4bf' };
}

export default function SensorTest() {
  const [data, setData] = useState({
    device_id: "SURGE_001",
    readings: [
      { sensor_id: 1, distance_cm: 0 },
      { sensor_id: 2, distance_cm: 0 },
      { sensor_id: 3, distance_cm: 0 },
      { sensor_id: 4, distance_cm: 0 }
    ]
  });

  const [history, setHistory] = useState([]); // last 20 rows for the chart
  const [lastUpdated, setLastUpdated] = useState('Not updated yet');
  const [isOnline, setIsOnline] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [selected, setSelected] = useState(RIVER_NODES[0]);
  const dashRef = useRef(null);

  const scrollToDashboard = () =>
    dashRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const handleSelect = (node) => {
    setSelected(node);
    setTimeout(scrollToDashboard, 1300); // wait for the fly animation
  };

  const fetchLiveData = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/sensor-data?device=${selected.id}`);
      if (response.ok) {
        const json = await response.json();
        if (json && json.readings) {
          setData(json);
          setIsOnline(true);
          setLastUpdated(new Date().toLocaleTimeString());
        } else {
          setIsOnline(false);
        }
      } else {
        setIsOnline(false);
      }
    } catch (err) {
      console.error("Backend connection error:", err);
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
    } catch (err) {
      console.error("History fetch error:", err);
    }
  };

  useEffect(() => {
  setIsOnline(false);
  setLastUpdated('Not updated yet');
  setHistory([]);
  setData({
    device_id: selected.id,
    readings: [1, 2, 3, 4].map((id) => ({ sensor_id: id, distance_cm: 0 })),
  });

  fetchLiveData();
  fetchHistory();
  const interval = setInterval(() => {
    fetchLiveData();
    fetchHistory();
  }, 3000);
  return () => clearInterval(interval);
}, [selected.id]);

  const avgDistance =
    data.readings.reduce((sum, r) => sum + r.distance_cm, 0) / (data.readings.length || 1);
  const avgStatus = statusForDistance(avgDistance);

  // Simple trend: compare the average of the first reading in the window
  // to the average of the most recent one, mirroring the shadcn demo's
  // "Trending up by X% this month" line.
  let trendLabel = null;
  let trendUp = false;
  if (history.length >= 2) {
    const avgOf = (row) => (row.s1 + row.s2 + row.s3 + row.s4) / 4;
    const first = avgOf(history[0]);
    const last = avgOf(history[history.length - 1]);
    if (first > 0) {
      const pctChange = ((last - first) / first) * 100;
      trendUp = pctChange >= 0;
      trendLabel = `${trendUp ? 'Rising' : 'Falling'} ${Math.abs(pctChange).toFixed(1)}% over this window`;
    }
  }

  const maxDistance = 200; // cm, used to scale the gauge bars — adjust to your sensor's mounted height

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.75); }
        }
        @keyframes rise {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
      `}</style>

      <div>
        <h1>My React Map App</h1>
        <MapComponent />
      </div>

      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <div style={styles.eyebrow}>River monitoring node</div>
            <h1 style={styles.title}>{data.device_id}</h1>
          </div>
          <div style={{
            ...styles.statusPill,
            borderColor: isOnline ? 'rgba(45, 212, 191, 0.4)' : 'rgba(248, 113, 113, 0.4)',
            background: isOnline ? 'rgba(45, 212, 191, 0.08)' : 'rgba(248, 113, 113, 0.08)',
          }}>
            <span style={{
              ...styles.statusDot,
              background: isOnline ? '#2dd4bf' : '#f87171',
              animation: isOnline ? 'pulse-dot 1.8s ease-in-out infinite' : 'none',
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
            Average clearance{' '}
            <strong style={{ ...styles.metaValue, color: avgStatus.color }}>
              {avgDistance.toFixed(1)} cm
            </strong>
          </span>
        </div>

        <div style={styles.grid}>
          {data.readings.map((sensor) => {
            const status = statusForDistance(sensor.distance_cm);
            const fillPct = Math.min(100, (sensor.distance_cm / maxDistance) * 100);
            return (
              <div key={sensor.sensor_id} style={styles.card}>
                <div style={styles.cardTop}>
                  <span style={styles.cardLabel}>Node {String(sensor.sensor_id).padStart(2, '0')}</span>
                  <span style={{ ...styles.statusTag, color: status.color, borderColor: status.color + '55' }}>
                    {status.label}
                  </span>
                </div>

                <div style={styles.gaugeRow}>
                  <div style={styles.gaugeTrack}>
                    <div
                      style={{
                        ...styles.gaugeFill,
                        height: `${fillPct}%`,
                        background: `linear-gradient(180deg, ${status.color}, ${status.color}33)`,
                      }}
                    />
                  </div>
                  <div style={styles.readingBlock}>
                    <div style={styles.readingValue}>{sensor.distance_cm.toFixed(1)}</div>
                    <div style={styles.readingUnit}>cm clearance</div>
                  </div>
                </div>
              </div>
            );
          })}
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

        <button
          style={styles.rawToggle}
          onClick={() => setShowRaw((v) => !v)}
        >
          {showRaw ? 'Hide raw payload' : 'Show raw payload'}
        </button>
        {showRaw && (
          <pre style={styles.jsonPreview}>
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at top, #0f2027 0%, #0a1620 55%, #060d13 100%)',
    padding: '40px 20px',
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
  },
  container: {
    maxWidth: '820px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '18px',
  },
  eyebrow: {
    fontSize: '14px',
    letterSpacing: '0.04em',
    color: '#5b8a94',
    marginBottom: '6px',
  },
  title: {
    margin: 0,
    fontSize: '32px',
    fontWeight: 700,
    color: '#e6f4f1',
    fontFamily: "'JetBrains Mono', monospace",
  },
  statusPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '999px',
    border: '1px solid',
    fontSize: '15px',
    fontWeight: 500,
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    fontSize: '15px',
    color: '#7fa0a8',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  metaValue: {
    color: '#d7ece8',
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 500,
  },
  metaDivider: {
    width: '1px',
    height: '12px',
    background: '#274850',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: '14px',
    marginBottom: '28px',
  },
  card: {
    background: 'linear-gradient(180deg, #10262c 0%, #0c1f24 100%)',
    border: '1px solid #1e3a40',
    borderRadius: '12px',
    padding: '16px',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  cardLabel: {
    fontSize: '14px',
    fontFamily: "'JetBrains Mono', monospace",
    color: '#8fb4ba',
  },
  statusTag: {
    fontSize: '13px',
    padding: '3px 10px',
    borderRadius: '999px',
    border: '1px solid',
  },
  gaugeRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '12px',
  },
  gaugeTrack: {
    width: '10px',
    height: '64px',
    borderRadius: '6px',
    background: '#08161a',
    display: 'flex',
    alignItems: 'flex-end',
    overflow: 'hidden',
    flexShrink: 0,
  },
  gaugeFill: {
    width: '100%',
    borderRadius: '6px',
    transformOrigin: 'bottom',
    animation: 'rise 0.6s ease-out',
  },
  readingBlock: {
    display: 'flex',
    flexDirection: 'column',
  },
  readingValue: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#eef7f5',
    fontFamily: "'JetBrains Mono', monospace",
    lineHeight: 1.1,
  },
  readingUnit: {
    fontSize: '13px',
    color: '#6f939a',
    marginTop: '2px',
  },
  chartSection: {
    background: 'linear-gradient(180deg, #0e2229 0%, #0a1a1f 100%)',
    border: '1px solid #1e3a40',
    borderRadius: '14px',
    padding: '22px',
    marginBottom: '18px',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  chartTitle: {
    margin: 0,
    fontSize: '18px',
    color: '#e6f4f1',
    fontWeight: 600,
  },
  chartSubtitle: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#6f939a',
  },
  trendTag: {
    fontSize: '15px',
    fontWeight: 600,
    fontFamily: "'JetBrains Mono', monospace",
  },
  rawToggle: {
    background: 'transparent',
    border: '1px solid #274850',
    color: '#8fb4ba',
    borderRadius: '8px',
    padding: '8px 14px',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
  },
  jsonPreview: {
    marginTop: '12px',
    background: '#08161a',
    color: '#5eead4',
    padding: '14px',
    borderRadius: '10px',
    overflowX: 'auto',
    fontSize: '14px',
    fontFamily: "'JetBrains Mono', monospace",
    border: '1px solid #1e3a40',
  },
};