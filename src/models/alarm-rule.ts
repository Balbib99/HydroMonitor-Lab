import type { AlarmSeverity, Metric } from './alarm';

export interface AlarmRule {
  metric: Metric;
  threshold: number;
  severity: AlarmSeverity;
}
