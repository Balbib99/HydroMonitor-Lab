import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ConnectionStatus } from '../models/connection';

@customElement('connection-status')
export class ConnectionStatusElement extends LitElement {
  @property({ type: String })
  status: ConnectionStatus = 'disconnected';

  static styles = css`
    :host {
      display: inline-block;
    }

    .status {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      width: fit-content;
      min-height: 2rem;
      padding: 0.35rem 0.65rem;
      border-radius: 999px;
      color: var(--text-muted, #5f7079);
      background: #edf1f4;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    .indicator {
      width: 0.55rem;
      height: 0.55rem;
      border-radius: 999px;
      background: currentColor;
    }

    .connecting,
    .reconnecting {
      color: var(--warning, #a15c00);
      background: var(--warning-bg, #fff1d0);
    }

    .connected {
      color: var(--success, #1f6b45);
      background: var(--success-bg, #e4f4ec);
    }
  `;

  render() {
    return html`
      <span
        class=${`status ${this.status}`}
        role="status"
        aria-live="polite"
      >
        <span class="indicator" aria-hidden="true"></span>
        ${this.status.toUpperCase()}
      </span>
    `;
  }
}
