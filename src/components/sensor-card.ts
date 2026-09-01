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
      min-width: 0;
      min-height: 10.5rem;
      padding: var(--space-lg, 1.5rem);
      border: 1px solid var(--border, #ccdce2);
      border-radius: var(--radius, 0.75rem);
      background: var(--surface, #ffffff);
      box-shadow: var(--shadow, 0 1rem 2.5rem rgb(15 47 63 / 10%));
      overflow-wrap: anywhere;
    }

    h2 {
      margin: 0;
      color: var(--text-muted, #5f7079);
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .reading {
      align-self: center;
      margin: var(--space-lg, 1.5rem) 0;
      color: var(--text, #15242b);
      font-size: clamp(2.25rem, 6vw, 3rem);
      font-weight: 700;
      line-height: 1;
    }

    .unit {
      color: var(--text-muted, #5f7079);
      font-size: 1.25rem;
      font-weight: 500;
    }

    .status {
      align-self: end;
      width: fit-content;
      padding: 0.35rem 0.65rem;
      border-radius: 999px;
      color: var(--success, #1f6b45);
      background: var(--success-bg, #e4f4ec);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    .status.warning {
      color: var(--warning, #a15c00);
      background: var(--warning-bg, #fff1d0);
    }

    @media (max-width: 42rem) {
      article {
        min-height: 9.5rem;
        padding: var(--space-md, 1rem);
      }

      .reading {
        font-size: clamp(2rem, 14vw, 2.75rem);
      }
    }
  `;

  render() {
    const isWarning =
      this.warningThreshold !== undefined && this.value >= this.warningThreshold;
    const status = isWarning ? 'WARNING' : 'NORMAL';

    return html`
      <article
        data-cy="sensor-card"
        aria-label=${`${this.label}: ${this.value} ${this.unit}, ${status}`}
      >
        <h2>${this.label}</h2>
        <div class="reading" data-cy="sensor-reading">
          ${this.value} <span class="unit">${this.unit}</span>
        </div>
        <div
          class=${isWarning ? 'status warning' : 'status'}
          data-cy="sensor-status"
        >
          ${status}
        </div>
      </article>
    `;
  }
}
