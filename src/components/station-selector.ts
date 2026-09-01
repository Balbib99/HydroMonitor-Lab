import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Station } from '../models/station';

export type StationSelectedDetail = {
  stationId: string;
};

@customElement('station-selector')
export class StationSelector extends LitElement {
  @property({ type: Array })
  stations: Station[] = [];

  @property({ type: String })
  selectedStationId = '';

  static styles = css`
    :host {
      display: block;
    }

    label {
      display: block;
      margin-bottom: var(--space-xs, 0.5rem);
      color: var(--text-muted, #5f7079);
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    select {
      width: 100%;
      min-height: 2.75rem;
      padding: 0.65rem 0.8rem;
      border: 1px solid var(--border, #ccdce2);
      border-radius: calc(var(--radius, 0.75rem) - 0.2rem);
      background: var(--surface, #ffffff);
      color: var(--text, #15242b);
      font: inherit;
      font-weight: 600;
    }

    select:focus-visible {
      border-color: var(--accent, #277da1);
      outline: 3px solid rgb(39 125 161 / 20%);
    }
  `;

  render() {
    return html`
      <label for="station-select">Station</label>
      <select
        data-cy="station-select"
        id="station-select"
        .value=${this.selectedStationId}
        @change=${this.handleChange}
      >
        ${this.stations.map(
          (station) => html`
            <option value=${station.id}>${station.name}</option>
          `,
        )}
      </select>
    `;
  }

  private handleChange(event: Event) {
    const select = event.currentTarget;

    if (!(select instanceof HTMLSelectElement)) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent<StationSelectedDetail>('station-selected', {
        detail: {
          stationId: select.value,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }
}
