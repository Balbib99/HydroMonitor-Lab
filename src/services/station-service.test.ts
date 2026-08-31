import type { Measurement } from '../models/measurement';
import type { Station } from '../models/station';
import { createMeasurement } from '../test-utils/create-measurement';
import { StationService } from './station-service';

const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;

function createJsonResponse<T>(ok: boolean, status: number, data: T): Response {
  return {
    ok,
    status,
    json: jest.fn().mockResolvedValue(data),
  } as unknown as Response;
}

function createStation(overrides: Partial<Station> = {}): Station {
  return {
    id: 'VA-001',
    name: 'Valladolid Norte',
    river: 'R\u00edo Pisuerga',
    latitude: 41.668,
    longitude: -4.728,
    status: 'online',
    ...overrides,
  };
}

describe('StationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = fetchMock;
  });

  test('returns stations when the stations endpoint succeeds', async () => {
    const stations = [createStation()];
    fetchMock.mockResolvedValue(createJsonResponse(true, 200, stations));

    const result = await StationService.getStations();

    expect(result).toEqual(stations);
  });

  test('throws when the stations endpoint returns 500', async () => {
    fetchMock.mockResolvedValue(createJsonResponse(false, 500, {}));

    await expect(StationService.getStations()).rejects.toThrow(
      'Unable to load stations: 500',
    );
  });

  test('returns latest measurement when the endpoint succeeds', async () => {
    const measurement = createMeasurement();
    fetchMock.mockResolvedValue(createJsonResponse(true, 200, measurement));

    const result = await StationService.getLatestMeasurement('VA-001');

    expect(result).toEqual(measurement);
  });

  test('throws when the latest measurement endpoint returns 404', async () => {
    fetchMock.mockResolvedValue(createJsonResponse(false, 404, {}));

    await expect(
      StationService.getLatestMeasurement('UNKNOWN'),
    ).rejects.toThrow('Unable to load latest measurement for station UNKNOWN: 404');
  });

  test('adds from and to query parameters for measurements', async () => {
    const measurements: Measurement[] = [createMeasurement()];
    fetchMock.mockResolvedValue(createJsonResponse(true, 200, measurements));

    await StationService.getMeasurements(
      'VA-001',
      '2026-08-30T00:00:00.000Z',
      '2026-08-31T00:00:00.000Z',
    );

    const calledUrl = fetchMock.mock.calls[0]?.[0];

    expect(calledUrl).toBeInstanceOf(URL);

    if (!(calledUrl instanceof URL)) {
      throw new Error('Expected fetch to be called with a URL');
    }

    expect(calledUrl.pathname).toBe('/api/stations/VA-001/measurements');
    expect(calledUrl.searchParams.get('from')).toBe(
      '2026-08-30T00:00:00.000Z',
    );
    expect(calledUrl.searchParams.get('to')).toBe('2026-08-31T00:00:00.000Z');
  });

  test('passes AbortSignal to latest measurement fetch', async () => {
    const measurement = createMeasurement();
    const controller = new AbortController();
    fetchMock.mockResolvedValue(createJsonResponse(true, 200, measurement));

    await StationService.getLatestMeasurement('VA-001', controller.signal);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/stations/VA-001/measurements/latest',
      { signal: controller.signal },
    );
  });
});
