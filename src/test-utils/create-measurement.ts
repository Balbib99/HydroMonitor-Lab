import type { Measurement } from '../models/measurement';

export function createMeasurement(
  overrides: Partial<Measurement> = {},
): Measurement {
  return {
    stationId: 'VA-001',
    timestamp: '2026-08-31T12:00:00.000Z',
    temperature: 24.7,
    humidity: 61,
    waterLevel: 2.34,
    flowRate: 42.8,
    rainfall: 0,
    quality: 'valid',
    ...overrides,
  };
}
