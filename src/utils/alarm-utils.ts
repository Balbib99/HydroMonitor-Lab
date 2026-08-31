import type { Alarm } from '../models/alarm';

export function mergeRecentAlarms(
  currentAlarms: Alarm[],
  newAlarms: Alarm[],
  maxAlarms: number,
): Alarm[] {
  const alarmsById = new Map<string, Alarm>();

  for (const alarm of [...currentAlarms, ...newAlarms]) {
    alarmsById.set(alarm.id, alarm);
  }

  return [...alarmsById.values()]
    .sort(
      (firstAlarm, secondAlarm) =>
        new Date(secondAlarm.timestamp).getTime() -
        new Date(firstAlarm.timestamp).getTime(),
    )
    .slice(0, maxAlarms);
}
