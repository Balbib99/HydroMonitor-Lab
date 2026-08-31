import type { AlarmRule } from '../models/alarm-rule';
import { createMeasurement } from '../test-utils/create-measurement';
import { evaluateMeasurement } from './alarm-engine';

describe('evaluateMeasurement', () => {
  const waterLevelRule: AlarmRule = {
    metric: 'waterLevel',
    threshold: 3.5,
    severity: 'critical',
  };

  const flowRateRule: AlarmRule = {
    metric: 'flowRate',
    threshold: 60,
    severity: 'warning',
  };

  test('does not create an alarm below the water level threshold', () => {
    const measurement = createMeasurement({ waterLevel: 3.49 });

    const result = evaluateMeasurement(measurement, [waterLevelRule]);

    expect(result).toEqual([]);
  });

  test('creates an alarm when water level reaches the threshold', () => {
    const measurement = createMeasurement({
      stationId: 'VA-003',
      waterLevel: 3.5,
    });

    const result = evaluateMeasurement(measurement, [waterLevelRule]);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      stationId: 'VA-003',
      timestamp: measurement.timestamp,
      metric: 'waterLevel',
      value: 3.5,
      threshold: 3.5,
      severity: 'critical',
    });
    expect(result[0]?.id).toContain('VA-003');
    expect(result[0]?.id).toContain('waterLevel');
    expect(result[0]?.id).toContain(measurement.timestamp);
  });

  test('creates a critical alarm when water level is above threshold', () => {
    const measurement = createMeasurement({
      stationId: 'VA-003',
      waterLevel: 4.2,
    });

    const result = evaluateMeasurement(measurement, [waterLevelRule]);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      metric: 'waterLevel',
      value: 4.2,
      threshold: 3.5,
      severity: 'critical',
    });
  });

  test('creates a warning alarm when flow rate is above threshold', () => {
    const measurement = createMeasurement({
      flowRate: 62,
    });

    const result = evaluateMeasurement(measurement, [flowRateRule]);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      metric: 'flowRate',
      value: 62,
      threshold: 60,
      severity: 'warning',
    });
  });

  test('creates two alarms when one measurement activates two rules', () => {
    const measurement = createMeasurement({
      waterLevel: 3.72,
      flowRate: 62,
    });

    const result = evaluateMeasurement(measurement, [
      waterLevelRule,
      flowRateRule,
    ]);

    expect(result).toHaveLength(2);
    expect(result.map((alarm) => alarm.metric)).toEqual([
      'waterLevel',
      'flowRate',
    ]);
  });

  test('returns an empty array when no rule is activated', () => {
    const measurement = createMeasurement({
      waterLevel: 2.8,
      flowRate: 42,
    });

    const result = evaluateMeasurement(measurement, [
      waterLevelRule,
      flowRateRule,
    ]);

    expect(result).toEqual([]);
  });
});
