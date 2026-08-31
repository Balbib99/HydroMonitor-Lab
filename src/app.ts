import { LitElement, css, html } from 'lit';
import { state } from 'lit/decorators.js';
import './components/sensor-card';
import './components/station-selector';
import { mockMeasurements } from './data/mock-measurements';
import { mockStations } from './data/mock-stations';
import type { StationSelectedDetail } from './components/station-selector';

export class HydroApp extends LitElement {
  @state()
  private selectedStationId = 'VA-001';

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

    .empty-state {
      padding: 1.5rem;
      border: 1px solid #d8e2e7;
      border-radius: 0.5rem;
      background: #ffffff;
      color: #536471;
      text-align: center;
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

  render() {
    const selectedStation = mockStations.find(
      (station) => station.id === this.selectedStationId,
    );
    const currentMeasurement = mockMeasurements.find(
      (measurement) => measurement.stationId === this.selectedStationId,
    );

    return html`
      <main>
        <header>
          <h1>HydroMonitor Lab</h1>
          <p>HydroMet Monitoring Dashboard</p>
        </header>

        <section class="dashboard-controls">
          <station-selector
            .stations=${mockStations}
            .selectedStationId=${this.selectedStationId}
            @station-selected=${this.handleStationSelected}
          ></station-selector>
        </section>

        ${selectedStation && currentMeasurement
          ? this.renderDashboard(selectedStation, currentMeasurement)
          : this.renderEmptyState()}
      </main>
    `;
  }

  private renderDashboard(
    selectedStation: (typeof mockStations)[number],
    currentMeasurement: (typeof mockMeasurements)[number],
  ) {
    return html`
      <section class="station-summary" aria-label="Selected station">
        <h2 class="station-name">${selectedStation.name}</h2>
        <p class="station-river">${selectedStation.river}</p>
        <span class=${`station-status ${selectedStation.status}`}>
          Status: ${selectedStation.status.toUpperCase()}
        </span>
      </section>

      <section class="sensor-grid" aria-label="Sensor overview">
        <sensor-card
          label="Temperature"
          .value=${currentMeasurement.temperature}
          .unit=${'\u00b0C'}
          .warningThreshold=${35}
        ></sensor-card>
        <sensor-card
          label="Humidity"
          .value=${currentMeasurement.humidity}
          unit="%"
        ></sensor-card>
        <sensor-card
          label="Water Level"
          .value=${currentMeasurement.waterLevel}
          unit="m"
          .warningThreshold=${3.5}
        ></sensor-card>
        <sensor-card
          label="Flow Rate"
          .value=${currentMeasurement.flowRate}
          .unit=${'m\u00b3/s'}
        ></sensor-card>
      </section>
    `;
  }

  private renderEmptyState() {
    return html`
      <p class="empty-state">
        No station data is available for the selected station.
      </p>
    `;
  }

  private handleStationSelected(event: CustomEvent<StationSelectedDetail>) {
    this.selectedStationId = event.detail.stationId;
  }
}

customElements.define('hydro-app', HydroApp);
