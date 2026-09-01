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
      padding: 0.35rem 0.6rem;
      border-radius: 999px;
      color: #5d6470;
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
      color: #8a4a00;
      background: #fff2d8;
    }

    .connected {
      color: #1f5c3b;
      background: #e8f6ee;
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
