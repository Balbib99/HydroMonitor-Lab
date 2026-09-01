# Performance Notes

HydroMonitor Lab currently keeps the browser workload small by storing only the most recent `MAX_POINTS = 200` measurements in the frontend. This is enough for the educational dashboard phase and avoids unbounded arrays during realtime updates.

The chart component also keeps a single Chart.js instance alive. It creates the chart once, updates the existing chart data when properties change, disables animation for frequent updates, and destroys the chart when the Web Component is disconnected.

## Large Dataset Strategy

For 500,000 or millions of measurements, the browser should not receive every raw point. A production HydroMet application should reduce data before it reaches the chart.

Suggested data flow:

```text
raw measurements
  -> backend query by station, metric, and time range
  -> server-side aggregation or downsampling
  -> reduced dataset for the selected zoom/range
  -> frontend chart
```

Recommended techniques:

- Limit every request by time range, station, and metric.
- Aggregate data on the server for wide time ranges, such as hourly or daily buckets.
- Downsample data according to chart width and zoom level.
- Load higher-resolution data only when the user zooms into a smaller range.
- Avoid sending all historical measurements to the browser.
- Use pagination or chunked responses for tables and exports.
- Cache common ranges, such as the last 24 hours.
- Consider Web Workers for expensive client-side processing.
- Consider Canvas or WebGL rendering for very dense visualizations.

These strategies are documented here only. This phase does not implement backend aggregation, downsampling, pagination, Web Workers, or WebGL.

## Debounce

No debounce was added in this phase. The current interactions are a native station select and realtime updates, so there is no continuous text input, slider, or high-frequency user interaction that would benefit from debouncing.
