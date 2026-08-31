export type StationStatus = 'online' | 'warning' | 'offline';

export interface Station {
  id: string;
  name: string;
  river: string;
  latitude: number;
  longitude: number;
  status: StationStatus;
}
