import { Component, input, output } from '@angular/core';

type Station = {
  id: string;
  name: string;
};

@Component({
  selector: 'app-station-selector',
  standalone: true,
  templateUrl: './station-selector.component.html',
  styleUrl: './station-selector.component.css',
})
export class StationSelectorComponent {
  stations = input<Station[]>([]);
  selectedStationId = input('');
  stationSelected = output<string>();

  handleChange(event: Event) {
    const select = event.currentTarget;

    if (!(select instanceof HTMLSelectElement)) {
      return;
    }

    this.stationSelected.emit(select.value);
  }
}
