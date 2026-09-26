import React, { useState, useEffect } from 'react';
import SensorAreaChart from './components/SensorAreaChart';

// Point this at wherever your Express server actually runs.
const API_BASE = 'http://localhost:3000';

export default function SensorTest() {
  const [data, setData] = useState({
    device_id: "river_node_uno_test",
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

  const fetchLiveData = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/sensor-data`);
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
      const response = await fetch(`${API_BASE}/api/history`);
      if (response.ok) {
        const rows = await response.json();
        setHistory(rows);
      }
    } catch (err) {
      console.error("History fetch error:", err);
    }
  };

  useEffect(() => {
    fetchLiveData();
    fetchHistory();
    const interval = setInterval(() => {
      fetchLiveData();
      fetchHistory();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const avgDistance =
    data.readings.reduce((sum, r) => sum + r.distance_cm, 0) / (data.readings.length || 1);

  // Simple trend: compare the average of the first reading in the window
  // to the average of the most recent one, mirroring the shadcn demo's
  // "Trending up by X% this month" line.
  let trendLabel = null;
  if (history.length >= 2) {
    const avgOf = (row) => (row.s1 + row.s2 + row.s3 + row.s4) / 4;
    const first = avgOf(history[0]);
    const last = avgOf(history[history.length - 1]);
    if (first > 0) {
      const pctChange = ((last - first) / first) * 100;
      const direction = pctChange >= 0 ? 'up' : 'down';
      trendLabel = `Trending ${direction} by ${Math.abs(pctChange).toFixed(1)}% over this window`;
    }
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>River Sensor Test Panel</h2>
        <div>
          <span style={{ ...styles.badge, backgroundColor: isOnline ? '#10b981' : '#ef4444' }}>
            {isOnline ? 'LIVE DATA' : 'OFFLINE / DISCONNECTED'}
          </span>
        </div>
      </header>

      <div style={styles.infoBar}>
        <p><strong>Device ID:</strong> <code>{data.device_id}</code></p>
        <p><strong>Last Updated:</strong> {lastUpdated}</p>
        <p><strong>Average Clearance:</strong> {avgDistance.toFixed(1)} cm</p>
      </div>

      <div style={styles.grid}>
        {data.readings.map((sensor) => (
          <div key={sensor.sensor_id} style={styles.card}>
            <h4 style={{ margin: '0 0 10px 0' }}>Sensor Node #{sensor.sensor_id}</h4>
            <div style={styles.valueDisplay}>
              {sensor.distance_cm.toFixed(1)} <span style={{ fontSize: '16px' }}>cm</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px' }}>
        <p style={styles.sectionLabel}>Raw JSON Stream Received:</p>
        <pre style={styles.jsonPreview}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: '20px' }}>
        <p style={styles.sectionLabel}>Real-Time Sensor Chart (last 20 readings):</p>
        <div style={styles.chartCard}>
          <h3 style={{ margin: 0 }}>Distance Readings - Gradient</h3>
          <p style={{ margin: '4px 0 16px 0', fontSize: '13px', color: '#94a3b8' }}>
            Showing clearance distance for all 4 sensors
          </p>
          <SensorAreaChart data={history} />
          {trendLabel && (
            <p style={{ marginTop: '12px', fontSize: '14px', fontWeight: 'bold' }}>
              {trendLabel}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'system-ui, sans-serif',
    maxWidth: '800px',
    margin: '20px auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #ddd',
    paddingBottom: '10px',
  },
  badge: {
    color: '#fff',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  infoBar: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: '10px 15px',
    borderRadius: '6px',
    margin: '15px 0',
    border: '1px solid #eee',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '15px',
  },
  card: {
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '15px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  valueDisplay: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#2563eb',
  },
  sectionLabel: {
    margin: '0 0 5px 0',
    fontSize: '14px',
    color: '#666',
  },
  jsonPreview: {
    backgroundColor: '#1e293b',
    color: '#38bdf8',
    padding: '12px',
    borderRadius: '6px',
    overflowX: 'auto',
    fontSize: '13px',
  },
  chartCard: {
    backgroundColor: '#0f172a',
    color: '#f1f5f9',
    padding: '20px',
    borderRadius: '10px',
    border: '1px solid #1e293b',
  },
};