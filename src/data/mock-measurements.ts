import type { Measurement } from '../models/measurement';

export const mockMeasurements: Measurement[] = [
  {
    stationId: 'VA-001',
    timestamp: '2026-08-31T09:00:00.000Z',
    temperature: 24.7,
    humidity: 61,
    waterLevel: 2.34,
    flowRate: 42.8,
    rainfall: 0,
    quality: 'valid',
  },
  {
    stationId: 'VA-002',
    timestamp: '2026-08-31T09:00:00.000Z',
    temperature: 21.3,
    humidity: 67,
    waterLevel: 2.87,
    flowRate: 50.1,
    rainfall: 0.4,
    quality: 'valid',
  },
  {
    stationId: 'VA-003',
    timestamp: '2026-08-31T09:00:00.000Z',
    temperature: 22.6,
    humidity: 64,
    waterLevel: 3.72,
    flowRate: 55.8,
    rainfall: 1.2,
    quality: 'valid',
  },
];
