import type { Measurement } from '../models/measurement';
import type { Station } from '../models/station';

const API_BASE_URL = 'http://localhost:3001/api';

async function parseJsonResponse<T>(
  response: Response,
  errorMessage: string,
): Promise<T> {
  if (!response.ok) {
    throw new Error(`${errorMessage}: ${response.status}`);
  }

  return (await response.json()) as T;
}

export class StationService {
  static async getStations(signal?: AbortSignal): Promise<Station[]> {
    const response = await fetch(`${API_BASE_URL}/stations`, { signal });

    return parseJsonResponse<Station[]>(
      response,
      'Unable to load stations',
    );
  }

  static async getStation(id: string): Promise<Station> {
    const response = await fetch(`${API_BASE_URL}/stations/${id}`);

    return parseJsonResponse<Station>(
      response,
      `Unable to load station ${id}`,
    );
  }

  static async getLatestMeasurement(
    stationId: string,
    signal?: AbortSignal,
  ): Promise<Measurement> {
    const response = await fetch(
      `${API_BASE_URL}/stations/${stationId}/measurements/latest`,
      { signal },
    );

    return parseJsonResponse<Measurement>(
      response,
      `Unable to load latest measurement for station ${stationId}`,
    );
  }

  static async getMeasurements(
    stationId: string,
    from?: string,
    to?: string,
    signal?: AbortSignal,
  ): Promise<Measurement[]> {
    const url = new URL(`${API_BASE_URL}/stations/${stationId}/measurements`);
    const queryParams = new URLSearchParams();

    if (from) {
      queryParams.set('from', from);
    }

    if (to) {
      queryParams.set('to', to);
    }

    url.search = queryParams.toString();

    const response = await fetch(url, { signal });

    return parseJsonResponse<Measurement[]>(
      response,
      `Unable to load measurements for station ${stationId}`,
    );
  }
}
