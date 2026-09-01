import type { Station } from '../models/station.js';

export const mockStations: Station[] = [
  {
    id: 'VA-001',
    name: 'Valladolid Norte',
    river: 'R\u00edo Pisuerga',
    latitude: 41.668,
    longitude: -4.728,
    status: 'operational',
  },
  {
    id: 'VA-002',
    name: 'Pisuerga Centro',
    river: 'R\u00edo Pisuerga',
    latitude: 41.652,
    longitude: -4.724,
    status: 'degraded',
  },
  {
    id: 'VA-003',
    name: 'Esgueva',
    river: 'R\u00edo Esgueva',
    latitude: 41.659,
    longitude: -4.704,
    status: 'operational',
  },
];
