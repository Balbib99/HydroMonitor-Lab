import type { Measurement } from '../../src/models/measurement.js';

const intervalMinutes = 30;
const pointsPerStation = 48;
const endTime = roundDownToInterval(new Date(), intervalMinutes);

type StationProfile = {
  stationId: string;
  baseTemperature: number;
  baseHumidity: number;
  baseWaterLevel: number;
  baseFlowRate: number;
  baseRainfall: number;
};

const stationProfiles: StationProfile[] = [
  {
    stationId: 'VA-001',
    baseTemperature: 24.2,
    baseHumidity: 61,
    baseWaterLevel: 2.24,
    baseFlowRate: 42,
    baseRainfall: 0,
  },
  {
    stationId: 'VA-002',
    baseTemperature: 21,
    baseHumidity: 67,
    baseWaterLevel: 2.78,
    baseFlowRate: 49,
    baseRainfall: 0.3,
  },
  {
    stationId: 'VA-003',
    baseTemperature: 22.3,
    baseHumidity: 64,
    baseWaterLevel: 3.35,
    baseFlowRate: 54,
    baseRainfall: 0.8,
  },
];

export const historicalMeasurements: Measurement[] = stationProfiles.flatMap(
  (profile) => createStationHistory(profile),
);

function createStationHistory(profile: StationProfile): Measurement[] {
  return Array.from({ length: pointsPerStation }, (_, index) => {
    const timestamp = new Date(
      endTime.getTime() -
        (pointsPerStation - 1 - index) * intervalMinutes * 60 * 1000,
    ).toISOString();

    const trend = index / (pointsPerStation - 1);
    const wave = Math.sin(index / 5);
    const rainPulse = index > 30 ? (index - 30) * 0.04 : 0;
    const waterRise = profile.stationId === 'VA-003' ? trend * 0.42 : trend * 0.16;

    return {
      stationId: profile.stationId,
      timestamp,
      temperature: round(profile.baseTemperature + wave * 1.2 - trend * 0.4),
      humidity: round(profile.baseHumidity + Math.cos(index / 6) * 3),
      waterLevel: round(profile.baseWaterLevel + waterRise + wave * 0.08),
      flowRate: round(profile.baseFlowRate + waterRise * 10 + wave * 1.8),
      rainfall: round(profile.baseRainfall + rainPulse),
      quality: 'valid',
    };
  });
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundDownToInterval(date: Date, minutes: number): Date {
  const rounded = new Date(date);
  const currentMinutes = rounded.getMinutes();
  rounded.setMinutes(currentMinutes - (currentMinutes % minutes), 0, 0);
  return rounded;
}
