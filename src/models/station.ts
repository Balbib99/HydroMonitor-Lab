export type StationStatus = 'operational' | 'degraded' | 'offline';

export interface Station {
  id: string;
  name: string;
  river: string;
  latitude: number;
  longitude: number;
  status: StationStatus;
}
