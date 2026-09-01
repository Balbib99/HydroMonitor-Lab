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
      margin-bottom: 0.5rem;
      color: #20323b;
      font-size: 0.875rem;
      font-weight: 700;
    }

    select {
      width: 100%;
      min-height: 2.75rem;
      padding: 0.65rem 0.8rem;
      border: 1px solid #b9c9d2;
      border-radius: 0.5rem;
      background: #ffffff;
      color: #172026;
      font: inherit;
    }

    select:focus-visible {
      border-color: #277da1;
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
