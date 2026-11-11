export const API_BASE = 'http://localhost:3000';
export const THRESHOLDS = { danger: 14, watch: 16 };

export function statusForDistance(cm) {
  if (cm <= THRESHOLDS.danger) return { key: 'danger', label: 'Low clearance', color: '#f87171' };
  if (cm <= THRESHOLDS.watch) return { key: 'watch', label: 'Watch', color: '#fbbf24' };
  return { key: 'safe', label: 'Clear', color: '#2dd4bf' };
}

export const emptyData = (deviceId) => ({
  device_id: deviceId,
  readings: [1, 2, 3, 4].map((id) => ({ sensor_id: id, distance_cm: 0 })),
});