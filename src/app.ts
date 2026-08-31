import { LitElement, css, html } from 'lit';

export class HydroApp extends LitElement {
  static styles = css`
    :host {
      display: grid;
      min-height: 100vh;
      place-items: center;
      padding: 2rem;
    }

    main {
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
  `;

  render() {
    return html`
      <main>
        <h1>HydroMonitor Lab</h1>
        <p>HydroMet Monitoring Dashboard</p>
      </main>
    `;
  }
}

customElements.define('hydro-app', HydroApp);
