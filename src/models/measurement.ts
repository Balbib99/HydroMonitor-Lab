export type QualityFlag = 'valid' | 'suspect' | 'missing';

export interface Measurement {
  stationId: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  waterLevel: number;
  flowRate: number;
  rainfall: number;
  quality: QualityFlag;
}
