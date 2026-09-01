import { LitElement, css, html } from 'lit';
import { state } from 'lit/decorators.js';
import './components/alarm-panel';
import './components/connection-status';
import './components/measurement-chart';
import './components/sensor-card';
import './components/station-selector';
import { alarmRules } from './config/alarm-rules';
import { RealtimeService } from './services/realtime-service';
import { StationService } from './services/station-service';
import { evaluateMeasurement } from './utils/alarm-engine';
import { mergeRecentAlarms } from './utils/alarm-utils';
import type { StationSelectedDetail } from './components/station-selector';
import type { Alarm } from './models/alarm';
import type { ConnectionStatus } from './models/connection';
import type { Measurement } from './models/measurement';
import type { Station } from './models/station';

const MAX_POINTS = 200;
const MAX_ALARMS = 20;

type LoadResult<T> =
  | {
      status: 'success';
      data: T;
    }
  | {
      status: 'error';
      error: unknown;
    };

export class HydroApp extends LitElement {
  @state()
  private stations: Station[] = [];

  @state()
  private selectedStationId = '';

  @state()
  private currentMeasurement?: Measurement;

  @state()
  private measurements: Measurement[] = [];

  @state()
  private loadingStations = false;

  @state()
  private loadingMeasurement = false;

  @state()
  private loadingHistory = false;

  @state()
  private stationError = '';

  @state()
  private measurementError = '';

  @state()
  private historyError = '';

  @state()
  private connectionStatus: ConnectionStatus = 'disconnected';

  @state()
  private alarms: Alarm[] = [];

  private stationController?: AbortController;

  private stationDataController?: AbortController;

  private disconnectRealtime?: () => void;

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      padding: var(--space-lg);
    }

    main {
      width: min(94vw, 100rem);
      margin: 0 auto;
      overflow-wrap: anywhere;
    }

    .app-header,
    .station-context,
    .message {
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--surface);
      box-shadow: var(--shadow);
    }

    .app-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--space-md);
      margin-bottom: var(--space-md);
      padding: var(--space-md) var(--space-lg);
    }

    connection-status {
      flex: 0 0 auto;
    }

    station-selector,
    sensor-card,
    measurement-chart,
    alarm-panel {
      min-width: 0;
    }

    h1 {
      margin: 0;
      color: var(--text);
      font-size: 2.1rem;
      font-weight: 700;
      line-height: 1.1;
    }

    p {
      margin: 0.25rem 0 0;
      color: var(--text-muted);
      font-size: 1rem;
    }

    .eyebrow {
      display: block;
      margin-bottom: 0.35rem;
      color: var(--accent-strong);
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .station-context {
      margin-bottom: var(--space-md);
      padding: var(--space-md) var(--space-lg);
    }

    .station-context-grid {
      display: grid;
      grid-template-columns: minmax(16rem, 24rem) 1fr;
      gap: var(--space-md);
      align-items: center;
    }

    .station-meta {
      display: grid;
      gap: var(--space-xs);
      padding: var(--space-sm) var(--space-md);
      border: 1px solid var(--border);
      border-radius: calc(var(--radius) - 0.15rem);
      background: var(--surface-muted);
    }

    .station-name {
      margin: 0;
      color: var(--text);
      font-size: 1.3rem;
      font-weight: 700;
      line-height: 1.2;
    }

    .station-river {
      margin: 0;
      color: var(--text-muted);
      font-size: 1rem;
    }

    .station-status {
      width: fit-content;
      padding: 0.35rem 0.65rem;
      border-radius: 999px;
      color: var(--success);
      background: var(--success-bg);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    .station-status.degraded {
      color: var(--warning);
      background: var(--warning-bg);
    }

    .station-status.offline {
      color: var(--text-muted);
      background: #e8eef1;
    }

    .sensor-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: var(--space-sm);
    }

    .history-section {
      margin-top: var(--space-md);
    }

    .insights-grid {
      margin-top: var(--space-md);
    }

    .message {
      padding: var(--space-lg);
      color: var(--text-muted);
      text-align: center;
    }

    .message.error {
      border-color: #efb39f;
      color: var(--critical);
      background: var(--critical-bg);
    }

    @media (max-width: 64rem) {
      .sensor-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (min-width: 75rem) {
      .insights-grid {
        display: grid;
        grid-template-columns: minmax(0, 2.2fr) minmax(300px, 0.8fr);
        gap: var(--space-md);
        align-items: start;
      }

      .history-section {
        margin-top: 0;
      }

      .insights-grid measurement-chart,
      .insights-grid alarm-panel {
        margin-top: 0;
      }
    }

    @media (max-width: 42rem) {
      :host {
        padding: var(--space-md);
      }

      .app-header {
        flex-direction: column;
        padding: var(--space-md);
      }

      h1 {
        font-size: 2rem;
      }

      .station-context {
        padding: var(--space-md);
      }

      .station-context-grid,
      .sensor-grid {
        grid-template-columns: 1fr;
      }

      .insights-grid {
        margin-top: var(--space-md);
      }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    void this.loadStations();
  }

  disconnectedCallback() {
    this.stationController?.abort();
    this.stationDataController?.abort();
    this.closeRealtimeConnection();
    super.disconnectedCallback();
  }

  render() {
    const selectedStation = this.stations.find(
      (station) => station.id === this.selectedStationId,
    );
    const selectedStationAlarms = this.alarms.filter(
      (alarm) => alarm.stationId === this.selectedStationId,
    );

    return html`
      <main data-cy="app-main">
        <header class="app-header">
          <div>
            <span class="eyebrow">Environmental telemetry</span>
            <h1>HydroMonitor Lab</h1>
            <p>HydroMet Monitoring Dashboard</p>
          </div>
          <connection-status
            data-cy="connection-status"
            .status=${this.connectionStatus}
          ></connection-status>
        </header>

        ${this.renderStationState(selectedStation, selectedStationAlarms)}
      </main>
    `;
  }

  private renderStationState(
    selectedStation: Station | undefined,
    selectedStationAlarms: Alarm[],
  ) {
    if (this.loadingStations) {
      return this.renderMessage('Loading stations...');
    }

    if (this.stationError) {
      return this.renderMessage('Error loading stations', true);
    }

    if (this.stations.length === 0) {
      return this.renderMessage('No stations available');
    }

    return html`
      ${selectedStation
        ? this.renderDashboard(selectedStation, selectedStationAlarms)
        : this.renderMessage(
            'No station data is available for the selected station.',
          )}
    `;
  }

  private renderDashboard(
    selectedStation: Station,
    selectedStationAlarms: Alarm[],
  ) {
    return html`
      <section class="station-context" aria-label="Selected station">
        <span class="eyebrow">Station</span>
        <div class="station-context-grid">
          <station-selector
            data-cy="station-selector"
            .stations=${this.stations}
            .selectedStationId=${this.selectedStationId}
            @station-selected=${this.handleStationSelected}
          ></station-selector>
          <div class="station-meta">
            <h2 class="station-name">${selectedStation.name}</h2>
            <p class="station-river">${selectedStation.river}</p>
            <span class=${`station-status ${selectedStation.status}`}>
              ${selectedStation.status.toUpperCase()}
            </span>
          </div>
        </div>
      </section>

      ${this.renderMeasurementState()}
      <div class="insights-grid">
        ${this.renderHistoryState()}
        <alarm-panel
          data-cy="alarm-panel"
          .alarms=${selectedStationAlarms}
        ></alarm-panel>
      </div>
    `;
  }

  private renderMeasurementState() {
    if (this.loadingMeasurement) {
      return this.renderMessage('Loading measurement...');
    }

    if (this.measurementError) {
      return this.renderMessage('Error loading measurement', true);
    }

    if (!this.currentMeasurement) {
      return this.renderMessage('No measurement available');
    }

    return html`
      <section class="sensor-grid" aria-label="Sensor overview">
        <sensor-card
          data-cy="sensor-card-temperature"
          label="Temperature"
          .value=${this.currentMeasurement.temperature}
          .unit=${'\u00b0C'}
          .warningThreshold=${35}
        ></sensor-card>
        <sensor-card
          data-cy="sensor-card-humidity"
          label="Humidity"
          .value=${this.currentMeasurement.humidity}
          unit="%"
        ></sensor-card>
        <sensor-card
          data-cy="sensor-card-waterLevel"
          label="Water Level"
          .value=${this.currentMeasurement.waterLevel}
          unit="m"
          .warningThreshold=${3.5}
        ></sensor-card>
        <sensor-card
          data-cy="sensor-card-flowRate"
          label="Flow Rate"
          .value=${this.currentMeasurement.flowRate}
          .unit=${'m\u00b3/s'}
        ></sensor-card>
      </section>
    `;
  }

  private renderHistoryState() {
    if (this.loadingHistory) {
      return html`
        <section class="history-section">
          ${this.renderMessage('Loading historical data...')}
        </section>
      `;
    }

    if (this.historyError) {
      return html`
        <section class="history-section">
          ${this.renderMessage('Error loading historical data', true)}
        </section>
      `;
    }

    if (this.measurements.length === 0) {
      return html`
        <section class="history-section">
          ${this.renderMessage('No historical data available')}
        </section>
      `;
    }

    return html`
      <section class="history-section" aria-label="Historical measurements">
        <measurement-chart
          data-cy="measurement-chart"
          .measurements=${this.measurements}
          metric="waterLevel"
          label="Water Level"
          unit="m"
          .warningThreshold=${3.5}
        ></measurement-chart>
      </section>
    `;
  }

  private renderMessage(message: string, isError = false) {
    return html`<p class=${isError ? 'message error' : 'message'}>${message}</p>`;
  }

  private async loadStations() {
    this.stationController?.abort();
    this.stationController = new AbortController();
    const { signal } = this.stationController;

    this.loadingStations = true;
    this.stationError = '';

    try {
      const stations = await StationService.getStations(signal);

      this.stations = stations;
      this.selectedStationId = stations[0]?.id ?? '';

      if (this.selectedStationId) {
        void this.loadStationData(this.selectedStationId);
      }
    } catch (error) {
      if (this.isAbortError(error)) {
        return;
      }

      console.error(error);
      this.stationError = 'Error loading stations';
      this.stations = [];
      this.selectedStationId = '';
      this.currentMeasurement = undefined;
      this.measurements = [];
      this.alarms = [];
      this.closeRealtimeConnection();
    } finally {
      if (!signal.aborted) {
        this.loadingStations = false;
      }
    }
  }

  private async loadStationData(stationId: string) {
    this.closeRealtimeConnection();
    this.stationDataController?.abort();
    this.stationDataController = new AbortController();
    const { signal } = this.stationDataController;
    const { from, to } = this.createLast24HoursRange();

    this.loadingMeasurement = true;
    this.loadingHistory = true;
    this.measurementError = '';
    this.historyError = '';
    this.currentMeasurement = undefined;
    this.measurements = [];

    const latestPromise = StationService.getLatestMeasurement(
      stationId,
      signal,
    )
      .then((data): LoadResult<Measurement> => ({ status: 'success', data }))
      .catch((error: unknown): LoadResult<Measurement> => ({
        status: 'error',
        error,
      }));

    const historyPromise = StationService.getMeasurements(
      stationId,
      from,
      to,
      signal,
    )
      .then((data): LoadResult<Measurement[]> => ({ status: 'success', data }))
      .catch((error: unknown): LoadResult<Measurement[]> => ({
        status: 'error',
        error,
      }));

    const [latestResult, historyResult] = await Promise.all([
      latestPromise,
      historyPromise,
    ]);

    if (signal.aborted || stationId !== this.selectedStationId) {
      return;
    }

    if (latestResult.status === 'success') {
      this.currentMeasurement = latestResult.data;
      this.addAlarms(evaluateMeasurement(latestResult.data, alarmRules));
    } else if (!this.isAbortError(latestResult.error)) {
      console.error(latestResult.error);
      this.measurementError = 'Error loading measurement';
    }

    if (historyResult.status === 'success') {
      this.measurements = historyResult.data;
    } else if (!this.isAbortError(historyResult.error)) {
      console.error(historyResult.error);
      this.historyError = 'Error loading historical data';
    }

    this.loadingMeasurement = false;
    this.loadingHistory = false;
    this.openRealtimeConnection(stationId);
  }

  private handleStationSelected(event: CustomEvent<StationSelectedDetail>) {
    this.selectedStationId = event.detail.stationId;
    void this.loadStationData(event.detail.stationId);
  }

  private createLast24HoursRange() {
    const toDate = new Date();
    const fromDate = new Date(toDate.getTime() - 24 * 60 * 60 * 1000);

    return {
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
    };
  }

  private openRealtimeConnection(stationId: string) {
    this.connectionStatus = 'connecting';
    let closedManually = false;

    const disconnect = RealtimeService.connectToStation(stationId, {
      onMeasurement: (measurement) => {
        if (measurement.stationId !== this.selectedStationId) {
          return;
        }

        this.currentMeasurement = measurement;
        this.addMeasurement(measurement);
        this.addAlarms(evaluateMeasurement(measurement, alarmRules));
      },
      onOpen: () => {
        this.connectionStatus = 'connected';
      },
      onError: (error) => {
        if (closedManually) {
          return;
        }

        console.warn('Realtime connection error', error);
        this.connectionStatus = 'reconnecting';
      },
    });

    this.disconnectRealtime = () => {
      closedManually = true;
      disconnect();
      this.connectionStatus = 'disconnected';
    };
  }

  private closeRealtimeConnection() {
    this.disconnectRealtime?.();
    this.disconnectRealtime = undefined;
    this.connectionStatus = 'disconnected';
  }

  private addMeasurement(measurement: Measurement) {
    if (this.isDuplicateMeasurement(measurement)) {
      return;
    }

    const updatedMeasurements = [...this.measurements, measurement];
    this.measurements = updatedMeasurements.slice(-MAX_POINTS);
  }

  private isDuplicateMeasurement(measurement: Measurement) {
    return this.measurements.some(
      (existingMeasurement) =>
        existingMeasurement.stationId === measurement.stationId &&
        existingMeasurement.timestamp === measurement.timestamp,
    );
  }

  private addAlarms(newAlarms: Alarm[]) {
    if (newAlarms.length === 0) {
      return;
    }

    this.alarms = mergeRecentAlarms(this.alarms, newAlarms, MAX_ALARMS);
  }

  private isAbortError(error: unknown) {
    return error instanceof DOMException && error.name === 'AbortError';
  }
}

customElements.define('hydro-app', HydroApp);
