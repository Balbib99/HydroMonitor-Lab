import { LitElement, css, html } from 'lit';
import './components/sensor-card';

export class HydroApp extends LitElement {
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

    .sensor-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
      gap: 1rem;
    }
  `;

  render() {
    return html`
      <main>
        <header>
          <h1>HydroMonitor Lab</h1>
          <p>HydroMet Monitoring Dashboard</p>
        </header>

        <section class="sensor-grid" aria-label="Sensor overview">
          <sensor-card
            label="Temperature"
            .value=${24.7}
            .unit=${'\u00b0C'}
            .warningThreshold=${35}
          ></sensor-card>
          <sensor-card label="Humidity" .value=${61} unit="%"></sensor-card>
          <sensor-card
            label="Water Level"
            .value=${3.6}
            unit="m"
            .warningThreshold=${3.5}
          ></sensor-card>
          <sensor-card
            label="Flow Rate"
            .value=${42.8}
            .unit=${'m\u00b3/s'}
          ></sensor-card>
        </section>
      </main>
    `;
  }
}

customElements.define('hydro-app', HydroApp);
