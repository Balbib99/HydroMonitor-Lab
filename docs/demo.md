# HydroMonitor Lab Demo

This short demo is designed for a 3-5 minute walkthrough.

## Flow

1. Open the app.
   - "HydroMonitor Lab is an independent simulation of a HydroMet-style monitoring dashboard."

2. Explain the station selector.
   - "The station list is loaded from the local REST API, and changing stations aborts stale requests."

3. Show current readings.
   - "Sensor cards expose the latest temperature, humidity, water level, and flow rate."

4. Show the historical chart.
   - "Historical data is loaded through REST and rendered with Chart.js inside a Lit Web Component."

5. Show SSE realtime.
   - "REST loads the snapshot and historical data. After that, SSE keeps the dashboard updated in real time."

6. Show an alarm.
   - "Measurements are evaluated against local alarm rules, and recent alarms are deduplicated."

7. Mention Jest and Cypress.
   - "Jest covers isolated logic and services; Cypress verifies user flows in the browser."

8. Mention GitHub Actions.
   - "CI runs build, Jest, and Cypress on push and pull request."

## Talking Points

### Why Lit?

Lit provides lightweight Web Components with reactive properties and encapsulated styles. It keeps the project close to browser standards while still offering a clean component model.

### Why SSE?

SSE fits server-to-client telemetry where the browser receives ongoing updates. It is simpler than WebSockets when the client does not need a bidirectional realtime channel.

### Why REST + SSE?

REST is a good fit for snapshots, lists, and historical ranges. SSE complements it by pushing new measurements after the initial data has loaded.

### Why AbortController?

When the selected station changes quickly, old requests should not overwrite newer state. `AbortController` keeps those transitions predictable.

### Why Jest and Cypress?

Jest is fast for pure logic, services, and deterministic behavior. Cypress validates the real browser experience, including loading, errors, station changes, realtime updates, and responsive checks.

### What would change with 500k points?

The browser should not receive all raw points. I would add server-side aggregation/downsampling, range-based queries, cache-aware loading, and possibly Web Workers or specialized rendering paths.

### What would you improve next?

I would add SSE gap recovery after reconnects, user-selectable time ranges, stronger accessibility testing, and production-oriented data aggregation.
