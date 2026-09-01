import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

type Measurement = {
  stationId: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  waterLevel: number;
  flowRate: number;
  rainfall: number;
  quality: 'valid' | 'suspect' | 'missing';
};

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  connectToStation(stationId: string): Observable<Measurement> {
    return new Observable((subscriber) => {
      const eventSource = new EventSource(
        `/api/stations/${encodeURIComponent(stationId)}/measurements/stream`,
      );

      eventSource.onmessage = (event) => {
        subscriber.next(JSON.parse(event.data) as Measurement);
      };

      eventSource.onerror = (event) => {
        subscriber.error(event);
      };

      return () => {
        eventSource.close();
      };
    });
  }
}
