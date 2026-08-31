import type { Alarm, Metric } from '../models/alarm';
import type { AlarmRule } from '../models/alarm-rule';
import type { Measurement } from '../models/measurement';

export function evaluateMeasurement(
  measurement: Measurement,
  rules: AlarmRule[],
): Alarm[] {
  return rules
    .map((rule) => {
      const value = getMeasurementMetricValue(measurement, rule.metric);

      if (value < rule.threshold) {
        return undefined;
      }

      return {
        id: createAlarmId(measurement, rule.metric),
        stationId: measurement.stationId,
        timestamp: measurement.timestamp,
        metric: rule.metric,
        value,
        threshold: rule.threshold,
        severity: rule.severity,
      };
    })
    .filter((alarm): alarm is Alarm => alarm !== undefined);
}

export function getMeasurementMetricValue(
  measurement: Measurement,
  metric: Metric,
): number {
  switch (metric) {
    case 'temperature':
      return measurement.temperature;
    case 'humidity':
      return measurement.humidity;
    case 'waterLevel':
      return measurement.waterLevel;
    case 'flowRate':
      return measurement.flowRate;
    case 'rainfall':
      return measurement.rainfall;
  }
}

function createAlarmId(measurement: Measurement, metric: Metric): string {
  return `${measurement.stationId}-${metric}-${measurement.timestamp}`;
}
