import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('sensor-card')
export class SensorCard extends LitElement {
  @property({ type: String })
  label = '';

  @property({ type: Number })
  value = 0;

  @property({ type: String })
  unit = '';

  @property({ type: Number })
  warningThreshold?: number;

  static styles = css`
    :host {
      display: block;
    }

    article {
      display: grid;
      min-height: 12rem;
      padding: 1.5rem;
      border: 1px solid #d8e2e7;
      border-radius: 0.5rem;
      background: #ffffff;
      box-shadow: 0 0.75rem 2rem rgb(15 47 63 / 8%);
    }

    h2 {
      margin: 0;
      color: #20323b;
      font-size: 1rem;
      font-weight: 600;
    }

    .reading {
      align-self: center;
      margin: 1.5rem 0;
      color: #0f2f3f;
      font-size: clamp(2rem, 8vw, 3rem);
      font-weight: 700;
      line-height: 1;
    }

    .unit {
      color: #536471;
      font-size: 1.25rem;
      font-weight: 500;
    }

    .status {
      align-self: end;
      width: fit-content;
      padding: 0.35rem 0.6rem;
      border-radius: 999px;
      color: #1f5c3b;
      background: #e8f6ee;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    .status.warning {
      color: #8a4a00;
      background: #fff2d8;
    }
  `;

  render() {
    const isWarning =
      this.warningThreshold !== undefined && this.value >= this.warningThreshold;
    const status = isWarning ? 'WARNING' : 'NORMAL';

    return html`
      <article>
        <h2>${this.label}</h2>
        <div class="reading">
          ${this.value} <span class="unit">${this.unit}</span>
        </div>
        <div class=${isWarning ? 'status warning' : 'status'}>${status}</div>
      </article>
    `;
  }
}
