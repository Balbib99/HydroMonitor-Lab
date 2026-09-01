import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

type Station = {
  id: string;
  name: string;
  river: string;
  status: 'operational' | 'degraded' | 'offline';
};

@Injectable({ providedIn: 'root' })
export class StationService {
  private http = inject(HttpClient);

  getStations(): Observable<Station[]> {
    return this.http.get<Station[]>('/api/stations');
  }
}
