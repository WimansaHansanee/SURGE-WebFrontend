import React, { useState, useEffect } from 'react';

export default function SensorTest() {
  // Initial state matching your exact hardware JSON structure
  const [data, setData] = useState({
    device_id: "river_node_uno_test",
    readings: [
      { sensor_id: 1, distance_cm: 0 },
      { sensor_id: 2, distance_cm: 0 },
      { sensor_id: 3, distance_cm: 0 },
      { sensor_id: 4, distance_cm: 0 }
    ]
  });

  const [lastUpdated, setLastUpdated] = useState('Not updated yet');
  const [isOnline, setIsOnline] = useState(false);

  // Fetch telemetry from your local Express backend
  const fetchLiveData = async () => {
    try {
      // Replace with your Express IP/port if running on another machine (e.g., http://10.80.81.33:3000/api/sensor-data)
      const response = await fetch('/api/sensor-data'); 
      if (response.ok) {
        const json = await response.json();
        // Fallback check to ensure payload structure exists
        if (json && json.readings) {
          setData(json);
          setIsOnline(true);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      } else {
        setIsOnline(false);
      }
    } catch (err) {
      console.error("Backend connection error:", err);
      setIsOnline(false);
    }
  };

  // Poll backend every 3 seconds for quick testing
  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Calculate average clearance distance
  const avgDistance =
    data.readings.reduce((sum, r) => sum + r.distance_cm, 0) / (data.readings.length || 1);

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

      {/* Meta Information Bar */}
      <div style={styles.infoBar}>
        <p><strong>Device ID:</strong> <code>{data.device_id}</code></p>
        <p><strong>Last Updated:</strong> {lastUpdated}</p>
        <p><strong>Average Clearance:</strong> {avgDistance.toFixed(1)} cm</p>
      </div>

      {/* 4 Sensor Reading Cards */}
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

      {/* Raw Payload Preview for Verification */}
      <div style={{ marginTop: '20px' }}>
        <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>
          Raw JSON Stream Received:
        </p>
        <pre style={styles.jsonPreview}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}

// Basic inline styling for standard React app
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
  jsonPreview: {
    backgroundColor: '#1e293b',
    color: '#38bdf8',
    padding: '12px',
    borderRadius: '6px',
    overflowX: 'auto',
    fontSize: '13px',
  },
};