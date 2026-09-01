import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-sensor-card',
  standalone: true,
  templateUrl: './sensor-card.component.html',
  styleUrl: './sensor-card.component.css',
})
export class SensorCardComponent {
  label = input('');
  value = input(0);
  unit = input('');
  warningThreshold = input<number | undefined>(undefined);

  status = computed(() => {
    const threshold = this.warningThreshold();

    return threshold !== undefined && this.value() >= threshold
      ? 'WARNING'
      : 'NORMAL';
  });

  isWarning = computed(() => this.status() === 'WARNING');
}
