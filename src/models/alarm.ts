export type AlarmSeverity = 'warning' | 'critical';

export type Metric =
  | 'temperature'
  | 'humidity'
  | 'waterLevel'
  | 'flowRate'
  | 'rainfall';

export interface Alarm {
  id: string;
  stationId: string;
  timestamp: string;
  metric: Metric;
  value: number;
  threshold: number;
  severity: AlarmSeverity;
}
