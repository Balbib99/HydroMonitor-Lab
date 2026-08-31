import type { Metric } from '../models/alarm';

export type MetricMetadata = {
  label: string;
  unit: string;
};

export const metricMetadata: Record<Metric, MetricMetadata> = {
  temperature: {
    label: 'Temperature',
    unit: '\u00b0C',
  },
  humidity: {
    label: 'Humidity',
    unit: '%',
  },
  waterLevel: {
    label: 'Water Level',
    unit: 'm',
  },
  flowRate: {
    label: 'Flow Rate',
    unit: 'm\u00b3/s',
  },
  rainfall: {
    label: 'Rainfall',
    unit: 'mm',
  },
};

export function getMetricMetadata(metric: Metric): MetricMetadata {
  return metricMetadata[metric];
}
