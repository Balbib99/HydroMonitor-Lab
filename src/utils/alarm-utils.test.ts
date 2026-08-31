import type { Alarm } from '../models/alarm';
import { mergeRecentAlarms } from './alarm-utils';

function createAlarm(overrides: Partial<Alarm> = {}): Alarm {
  return {
    id: 'VA-003-waterLevel-2026-08-31T12:00:00.000Z',
    stationId: 'VA-003',
    timestamp: '2026-08-31T12:00:00.000Z',
    metric: 'waterLevel',
    value: 3.72,
    threshold: 3.5,
    severity: 'critical',
    ...overrides,
  };
}

describe('mergeRecentAlarms', () => {
  test('keeps two different alarms', () => {
    const existing = [createAlarm({ id: 'alarm-1' })];
    const incoming = [createAlarm({ id: 'alarm-2', metric: 'flowRate' })];

    const result = mergeRecentAlarms(existing, incoming, 20);

    expect(result).toHaveLength(2);
    expect(result.map((alarm) => alarm.id)).toContain('alarm-1');
    expect(result.map((alarm) => alarm.id)).toContain('alarm-2');
  });

  test('removes duplicated alarms', () => {
    const alarm = createAlarm({ id: 'duplicated-alarm' });

    const result = mergeRecentAlarms([alarm], [alarm], 20);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('duplicated-alarm');
  });

  test('sorts alarms newest first', () => {
    const older = createAlarm({
      id: 'older',
      timestamp: '2026-08-31T10:00:00.000Z',
    });
    const newer = createAlarm({
      id: 'newer',
      timestamp: '2026-08-31T12:00:00.000Z',
    });

    const result = mergeRecentAlarms([older], [newer], 20);

    expect(result.map((alarm) => alarm.id)).toEqual(['newer', 'older']);
  });

  test('limits the number of alarms', () => {
    const alarms = Array.from({ length: 25 }, (_, index) =>
      createAlarm({
        id: `alarm-${index}`,
        timestamp: new Date(Date.UTC(2026, 7, 31, 12, index)).toISOString(),
      }),
    );

    const result = mergeRecentAlarms([], alarms, 20);

    expect(result).toHaveLength(20);
    expect(result[0]?.id).toBe('alarm-24');
  });

  test('returns an empty array when there are no alarms', () => {
    const result = mergeRecentAlarms([], [], 20);

    expect(result).toEqual([]);
  });

  test('does not mutate original arrays', () => {
    const existing = [createAlarm({ id: 'existing' })];
    const incoming = [createAlarm({ id: 'incoming' })];
    const originalExisting = [...existing];
    const originalIncoming = [...incoming];

    mergeRecentAlarms(existing, incoming, 20);

    expect(existing).toEqual(originalExisting);
    expect(incoming).toEqual(originalIncoming);
  });
});
