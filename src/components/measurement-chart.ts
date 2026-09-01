import { LitElement, css, html, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { Chart, type ChartConfiguration } from 'chart.js/auto';
import type { Measurement } from '../models/measurement';
import type { Metric } from '../models/alarm';

type MetricValueGetter = (measurement: Measurement) => number;

const metricValueGetters: Record<Metric, MetricValueGetter> = {
  temperature: (measurement) => measurement.temperature,
  humidity: (measurement) => measurement.humidity,
  waterLevel: (measurement) => measurement.waterLevel,
  flowRate: (measurement) => measurement.flowRate,
  rainfall: (measurement) => measurement.rainfall,
};

@customElement('measurement-chart')
export class MeasurementChart extends LitElement {
  @property({ type: Array })
  measurements: Measurement[] = [];

  @property({ type: String })
  metric: Metric = 'waterLevel';

  @property({ type: String })
  label = '';

  @property({ type: String })
  unit = '';

  @property({ type: Number })
  warningThreshold?: number;

  @query('canvas')
  private canvas?: HTMLCanvasElement;

  private chart?: Chart<'line', number[], string>;

  static styles = css`
    :host {
      display: block;
      margin-top: var(--space-lg, 1.5rem);
    }

    article {
      min-width: 0;
      padding: var(--space-lg, 1.5rem);
      border: 1px solid var(--border, #ccdce2);
      border-radius: var(--radius, 0.75rem);
      background: var(--surface, #ffffff);
      box-shadow: var(--shadow, 0 1rem 2.5rem rgb(15 47 63 / 10%));
      overflow-wrap: anywhere;
    }

    h2 {
      margin: 0;
      color: var(--text, #15242b);
      font-size: 0.9rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      line-height: 1.2;
      text-transform: uppercase;
    }

    p {
      margin: 0.5rem 0 0;
      color: var(--text-muted, #5f7079);
      font-size: 0.95rem;
    }

    .chart-container {
      position: relative;
      min-width: 0;
      width: 100%;
      height: 21rem;
      margin-top: var(--space-lg, 1.5rem);
    }

    canvas {
      display: block;
      max-width: 100%;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    @media (max-width: 42rem) {
      article {
        padding: var(--space-md, 1rem);
      }

      .chart-container {
        height: 16rem;
      }
    }
  `;

  protected firstUpdated() {
    this.renderChart();
  }

  protected updated(changedProperties: PropertyValues<this>) {
    if (
      changedProperties.has('measurements') ||
      changedProperties.has('metric') ||
      changedProperties.has('label') ||
      changedProperties.has('unit') ||
      changedProperties.has('warningThreshold')
    ) {
      this.renderChart();
    }
  }

  disconnectedCallback() {
    this.chart?.destroy();
    this.chart = undefined;
    super.disconnectedCallback();
  }

  render() {
    const summary = this.getAccessibleSummary();

    return html`
      <article aria-labelledby="measurement-chart-title">
        <h2 id="measurement-chart-title">${this.label} - Last 24 Hours</h2>
        <p>${this.measurements.length} measurements, displayed as ${this.unit}</p>
        <p id="measurement-chart-summary" class="sr-only">${summary}</p>
        <div class="chart-container">
          <canvas
            aria-label="${this.label.toLowerCase()} measurements for the last 24 hours"
            aria-describedby="measurement-chart-summary"
            role="img"
          ></canvas>
        </div>
      </article>
    `;
  }

  private renderChart() {
    if (!this.canvas) {
      return;
    }

    const configuration = this.createChartConfiguration();

    if (!this.chart) {
      this.chart = new Chart(this.canvas, configuration);
      return;
    }

    this.chart.data = configuration.data;
    this.chart.options = configuration.options ?? {};
    this.chart.update();
  }

  private createChartConfiguration(): ChartConfiguration<'line', number[], string> {
    const chartData = this.getChartData();
    const datasets: ChartConfiguration<'line', number[], string>['data']['datasets'] =
      [
        {
          label: `${this.label} (${this.unit})`,
          data: chartData.values,
          borderColor: '#155f7d',
          backgroundColor: 'rgb(39 125 161 / 10%)',
          borderWidth: 2,
          fill: true,
          pointRadius: 2,
          pointHoverRadius: 4,
          tension: 0.3,
        },
      ];

    if (this.warningThreshold !== undefined) {
      datasets.push({
        label: `Warning threshold (${this.warningThreshold} ${this.unit})`,
        data: chartData.values.map(() => this.warningThreshold ?? 0),
        borderColor: '#a15c00',
        borderDash: [6, 6],
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
      });
    }

    return {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets,
      },
      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              boxWidth: 12,
              color: '#5f7079',
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            backgroundColor: '#0e2a36',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            displayColors: true,
          },
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
        scales: {
          x: {
            grid: {
              color: 'rgb(204 220 226 / 45%)',
            },
            ticks: {
              color: '#5f7079',
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 8,
            },
          },
          y: {
            grid: {
              color: 'rgb(204 220 226 / 45%)',
            },
            ticks: {
              color: '#5f7079',
            },
            title: {
              display: true,
              text: this.unit,
              color: '#5f7079',
            },
          },
        },
      },
    };
  }

  private getMetricValue(measurement: Measurement): number {
    return metricValueGetters[this.metric](measurement);
  }

  private getChartData() {
    return this.measurements.reduce(
      (chartData, measurement) => {
        chartData.labels.push(this.formatTime(measurement.timestamp));
        chartData.values.push(this.getMetricValue(measurement));
        return chartData;
      },
      {
        labels: [] as string[],
        values: [] as number[],
      },
    );
  }

  private getAccessibleSummary(): string {
    if (this.measurements.length === 0) {
      return `${this.label} chart. No measurements available.`;
    }

    const [firstMeasurement, ...remainingMeasurements] = this.measurements;
    let latestValue = this.getMetricValue(firstMeasurement);
    let minValue = latestValue;
    let maxValue = latestValue;

    for (const measurement of remainingMeasurements) {
      const value = this.getMetricValue(measurement);
      latestValue = value;
      minValue = Math.min(minValue, value);
      maxValue = Math.max(maxValue, value);
    }

    return `${this.label} chart. ${this.measurements.length} measurements. Latest value ${this.formatValue(
      latestValue,
    )} ${this.unit}. Range ${this.formatValue(minValue)} to ${this.formatValue(
      maxValue,
    )} ${this.unit}.`;
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
    }).format(new Date(timestamp));
  }
}
