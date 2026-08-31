import type { AlarmRule } from '../models/alarm-rule';

export const alarmRules: AlarmRule[] = [
  {
    metric: 'waterLevel',
    threshold: 3.5,
    severity: 'critical',
  },
  {
    metric: 'flowRate',
    threshold: 60,
    severity: 'warning',
  },
  {
    metric: 'rainfall',
    threshold: 10,
    severity: 'warning',
  },
];
