import type { Measurement } from '../models/measurement';

const API_BASE_URL = 'http://localhost:3001/api';

type RealtimeHandlers = {
  onMeasurement: (measurement: Measurement) => void;
  onOpen?: () => void;
  onError?: (error: Event) => void;
};

export class RealtimeService {
  static connectToStation(
    stationId: string,
    handlers: RealtimeHandlers,
  ): () => void {
    const encodedStationId = encodeURIComponent(stationId);
    const eventSource = new EventSource(
      `${API_BASE_URL}/stations/${encodedStationId}/measurements/stream`,
    );

    eventSource.onopen = () => {
      handlers.onOpen?.();
    };

    eventSource.onmessage = (event) => {
      try {
        const parsedData: unknown = JSON.parse(event.data);

        if (!isMeasurement(parsedData)) {
          console.warn('Received invalid SSE measurement payload', parsedData);
          return;
        }

        handlers.onMeasurement(parsedData);
      } catch (error) {
        console.warn('Unable to parse SSE measurement payload', error);
      }
    };

    eventSource.onerror = (event) => {
      handlers.onError?.(event);
    };

    return () => {
      eventSource.close();
    };
  }
}

function isMeasurement(value: unknown): value is Measurement {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.stationId === 'string' &&
    typeof value.timestamp === 'string' &&
    typeof value.temperature === 'number' &&
    typeof value.humidity === 'number' &&
    typeof value.waterLevel === 'number' &&
    typeof value.flowRate === 'number' &&
    typeof value.rainfall === 'number' &&
    value.quality === 'valid'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
