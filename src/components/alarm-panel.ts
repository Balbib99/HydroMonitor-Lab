import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Alarm } from '../models/alarm';
import { getMetricMetadata } from '../utils/metric-metadata';

@customElement('alarm-panel')
export class AlarmPanel extends LitElement {
  @property({ type: Array })
  alarms: Alarm[] = [];

  static styles = css`
    :host {
      display: block;
      margin-top: 1.5rem;
    }

    section {
      padding: 1.5rem;
      border: 1px solid #d8e2e7;
      border-radius: 0.5rem;
      background: #ffffff;
      box-shadow: 0 0.75rem 2rem rgb(15 47 63 / 8%);
    }

    h2 {
      margin: 0 0 1rem;
      color: #0f2f3f;
      font-size: 1.25rem;
      line-height: 1.2;
    }

    p {
      margin: 0;
      color: #536471;
    }

    ul {
      display: grid;
      gap: 0.75rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    li {
      display: grid;
      gap: 0.35rem;
      padding: 1rem;
      border: 1px solid #d8e2e7;
      border-left-width: 0.35rem;
      border-radius: 0.5rem;
      background: #f8fbfc;
    }

    li.warning {
      border-left-color: #d97706;
    }

    li.critical {
      border-left-color: #c2410c;
    }

    .severity {
      width: fit-content;
      padding: 0.3rem 0.55rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    .severity.warning {
      color: #8a4a00;
      background: #fff2d8;
    }

    .severity.critical {
      color: #8a2f18;
      background: #fff1ed;
    }

    .metric {
      color: #20323b;
      font-weight: 700;
    }

    .details,
    time {
      color: #536471;
      font-size: 0.95rem;
    }
  `;

  render() {
    return html`
      <section aria-labelledby="alarm-panel-title">
        <h2 id="alarm-panel-title">Active / Recent Alerts</h2>
        ${this.alarms.length > 0 ? this.renderAlarmList() : html`<p>No active alerts</p>`}
      </section>
    `;
  }

  private renderAlarmList() {
    return html`
      <ul>
        ${this.alarms.map((alarm) => this.renderAlarm(alarm))}
      </ul>
    `;
  }

  private renderAlarm(alarm: Alarm) {
    const metadata = getMetricMetadata(alarm.metric);

    return html`
      <li class=${alarm.severity}>
        <span class=${`severity ${alarm.severity}`}>
          ${alarm.severity.toUpperCase()}
        </span>
        <span class="metric">${metadata.label}</span>
        <span class="details">
          ${this.formatValue(alarm.value)} ${metadata.unit} &gt;=
          ${this.formatValue(alarm.threshold)} ${metadata.unit}
        </span>
        <time datetime=${alarm.timestamp}>${this.formatTime(alarm.timestamp)}</time>
      </li>
    `;
  }

  private formatValue(value: number): string {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(value);
  }

  private formatTime(timestamp: string): string {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(timestamp));
  }
}
