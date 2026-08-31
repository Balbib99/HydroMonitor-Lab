import { LitElement, css, html } from 'lit';
import { state } from 'lit/decorators.js';
import './components/sensor-card';
import './components/station-selector';
import { StationService } from './services/station-service';
import type { StationSelectedDetail } from './components/station-selector';
import type { Measurement } from './models/measurement';
import type { Station } from './models/station';

export class HydroApp extends LitElement {
  @state()
  private stations: Station[] = [];

  @state()
  private selectedStationId = '';

  @state()
  private currentMeasurement?: Measurement;

  @state()
  private loadingStations = false;

  @state()
  private loadingMeasurement = false;

  @state()
  private stationError = '';

  @state()
  private measurementError = '';

  private stationController?: AbortController;

  private measurementController?: AbortController;

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      padding: 2rem;
    }

    main {
      width: min(100%, 68rem);
      margin: 0 auto;
    }

    header {
      margin-bottom: 2rem;
      text-align: center;
    }

    h1 {
      margin: 0;
      color: #0f2f3f;
      font-size: 2.5rem;
      font-weight: 700;
      line-height: 1.1;
    }

    p {
      margin: 0.75rem 0 0;
      color: #536471;
      font-size: 1.125rem;
    }

    .dashboard-controls {
      max-width: 24rem;
      margin: 0 auto 1.5rem;
    }

    .station-summary {
      display: grid;
      gap: 0.25rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #d8e2e7;
    }

    .station-name {
      margin: 0;
      color: #0f2f3f;
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 1.2;
    }

    .station-river {
      margin: 0;
      color: #536471;
    }

    .station-status {
      width: fit-content;
      margin-top: 0.5rem;
      padding: 0.35rem 0.6rem;
      border-radius: 999px;
      color: #1f5c3b;
      background: #e8f6ee;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    .station-status.warning {
      color: #8a4a00;
      background: #fff2d8;
    }

    .station-status.offline {
      color: #5d6470;
      background: #edf1f4;
    }

    .sensor-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
      gap: 1rem;
    }

    .message {
      padding: 1.5rem;
      border: 1px solid #d8e2e7;
      border-radius: 0.5rem;
      background: #ffffff;
      color: #536471;
      text-align: center;
    }

    .message.error {
      border-color: #f0b4a8;
      color: #8a2f18;
      background: #fff1ed;
    }

    @media (max-width: 42rem) {
      :host {
        padding: 1rem;
      }

      h1 {
        font-size: 2rem;
      }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    void this.loadStations();
  }

  disconnectedCallback() {
    this.stationController?.abort();
    this.measurementController?.abort();
    super.disconnectedCallback();
  }

  render() {
    const selectedStation = this.stations.find(
      (station) => station.id === this.selectedStationId,
    );

    return html`
      <main>
        <header>
          <h1>HydroMonitor Lab</h1>
          <p>HydroMet Monitoring Dashboard</p>
        </header>

        ${this.renderStationState(selectedStation)}
      </main>
    `;
  }

  private renderStationState(selectedStation: Station | undefined) {
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
      <section class="dashboard-controls">
        <station-selector
          .stations=${this.stations}
          .selectedStationId=${this.selectedStationId}
          @station-selected=${this.handleStationSelected}
        ></station-selector>
      </section>

      ${selectedStation ? this.renderDashboard(selectedStation) : this.renderMessage(
        'No station data is available for the selected station.',
      )}
    `;
  }

  private renderDashboard(selectedStation: Station) {
    return html`
      <section class="station-summary" aria-label="Selected station">
        <h2 class="station-name">${selectedStation.name}</h2>
        <p class="station-river">${selectedStation.river}</p>
        <span class=${`station-status ${selectedStation.status}`}>
          Status: ${selectedStation.status.toUpperCase()}
        </span>
      </section>

      ${this.renderMeasurementState()}
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
          label="Temperature"
          .value=${this.currentMeasurement.temperature}
          .unit=${'\u00b0C'}
          .warningThreshold=${35}
        ></sensor-card>
        <sensor-card
          label="Humidity"
          .value=${this.currentMeasurement.humidity}
          unit="%"
        ></sensor-card>
        <sensor-card
          label="Water Level"
          .value=${this.currentMeasurement.waterLevel}
          unit="m"
          .warningThreshold=${3.5}
        ></sensor-card>
        <sensor-card
          label="Flow Rate"
          .value=${this.currentMeasurement.flowRate}
          .unit=${'m\u00b3/s'}
        ></sensor-card>
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
        void this.loadLatestMeasurement(this.selectedStationId);
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
    } finally {
      if (!signal.aborted) {
        this.loadingStations = false;
      }
    }
  }

  private async loadLatestMeasurement(stationId: string) {
    this.measurementController?.abort();
    this.measurementController = new AbortController();
    const { signal } = this.measurementController;

    this.loadingMeasurement = true;
    this.measurementError = '';
    this.currentMeasurement = undefined;

    try {
      const measurement = await StationService.getLatestMeasurement(
        stationId,
        signal,
      );

      this.currentMeasurement = measurement;
    } catch (error) {
      if (this.isAbortError(error)) {
        return;
      }

      console.error(error);
      this.measurementError = 'Error loading measurement';
    } finally {
      if (!signal.aborted) {
        this.loadingMeasurement = false;
      }
    }
  }

  private handleStationSelected(event: CustomEvent<StationSelectedDetail>) {
    this.selectedStationId = event.detail.stationId;
    void this.loadLatestMeasurement(event.detail.stationId);
  }

  private isAbortError(error: unknown) {
    return error instanceof DOMException && error.name === 'AbortError';
  }
}

customElements.define('hydro-app', HydroApp);
