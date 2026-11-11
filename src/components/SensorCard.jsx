import React from 'react';
import { statusForDistance } from '../utils/helpers';
import { styles } from '../styles/dashboardStyles';

export default function SensorCard({ sensor, maxDistance = 200 }) {
  const status = statusForDistance(sensor.distance_cm);
  const fillPct = Math.min(100, (sensor.distance_cm / maxDistance) * 100);

  return (
    <div style={styles.card}>
      <div style={styles.cardTop}>
        <span style={styles.cardLabel}>
          Node {String(sensor.sensor_id).padStart(2, '0')}
        </span>
        <span
          style={{
            ...styles.statusTag,
            color: status.color,
            borderColor: status.color + '55',
          }}
        >
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
}