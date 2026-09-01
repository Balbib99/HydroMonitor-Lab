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
      margin-top: var(--space-lg, 1.5rem);
    }

    section {
      min-width: 0;
      padding: var(--space-lg, 1.5rem);
      border: 1px solid var(--border, #ccdce2);
      border-radius: var(--radius, 0.75rem);
      background: var(--surface, #ffffff);
      box-shadow: var(--shadow, 0 1rem 2.5rem rgb(15 47 63 / 10%));
      overflow-wrap: anywhere;
    }

    h2 {
      margin: 0 0 var(--space-md, 1rem);
      color: var(--text, #15242b);
      font-size: 0.9rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      line-height: 1.2;
      text-transform: uppercase;
    }

    p {
      margin: 0;
      padding: var(--space-md, 1rem);
      border: 1px dashed var(--border, #ccdce2);
      border-radius: calc(var(--radius, 0.75rem) - 0.15rem);
      background: var(--surface-muted, #f6fafb);
      color: var(--text-muted, #5f7079);
    }

    ul {
      display: grid;
      gap: var(--space-sm, 0.75rem);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    li {
      display: grid;
      gap: 0.35rem;
      padding: var(--space-md, 1rem);
      border: 1px solid var(--border, #ccdce2);
      border-left-width: 0.35rem;
      border-radius: calc(var(--radius, 0.75rem) - 0.15rem);
      background: var(--surface-muted, #f6fafb);
      overflow-wrap: anywhere;
    }

    li.warning {
      border-left-color: var(--warning, #a15c00);
    }

    li.critical {
      border-left-color: var(--critical, #a33a1d);
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
      color: var(--warning, #a15c00);
      background: var(--warning-bg, #fff1d0);
    }

    .severity.critical {
      color: var(--critical, #a33a1d);
      background: var(--critical-bg, #fff0eb);
    }

    .metric {
      color: var(--text, #15242b);
      font-weight: 700;
    }

    .details,
    time {
      color: var(--text-muted, #5f7079);
      font-size: 0.95rem;
    }

    @media (max-width: 42rem) {
      section {
        padding: var(--space-md, 1rem);
      }
    }
  `;

  render() {
    return html`
      <section aria-labelledby="alarm-panel-title" aria-live="polite">
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
      <li
        class=${alarm.severity}
        aria-label=${`${alarm.severity} alert for ${metadata.label}: ${this.formatValue(
          alarm.value,
        )} ${metadata.unit} is greater than or equal to ${this.formatValue(
          alarm.threshold,
        )} ${metadata.unit}`}
      >
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
