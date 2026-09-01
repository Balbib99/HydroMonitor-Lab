# Lit vs Angular

HydroMonitor Lab uses Lit as its primary runtime. The Angular examples in `examples/angular-comparison/` are educational snippets for interview preparation; they are not part of the running application.

The public role context mentions frontend technologies such as Lit and Angular/React. This document compares how the same UI and data-flow problems can be expressed with different tools. It does not describe any internal KISTERS architecture.

## Same problem, different tool

Frontend frameworks change the APIs, but many problems stay the same: inputs, internal state, derived state, child-to-parent events, HTTP, async operations, cleanup, testing, and separation of concerns.

## Main Comparison

| Need | Lit | Angular |
| --- | --- | --- |
| Component | `LitElement` | `@Component` |
| Input | `@property` | `input()` / `@Input()` |
| Internal state | `@state` | `signal()` / component state |
| Derived state | getter / `filter()` in render | `computed()` |
| Child -> parent | `CustomEvent` | `output()` / `@Output()` |
| HTTP | `fetch()` | `HttpClient` |
| Async | `Promise` / `async` / `await` | `Observable` |
| Cancel stale requests | `AbortController` | `switchMap()` |
| Services | ES module service class | DI service |
| Realtime | `EventSource` service | `EventSource` / RxJS service |
| Template | Lit `html` template literal | Angular template |

## Component Equivalences

| Concept | Lit | Angular |
| --- | --- | --- |
| Component definition | `LitElement` / `@customElement` | `@Component` |
| Public input | `@property` | `input()` / `@Input()` |
| Internal state | `@state` | `signal()` / component state |
| Template | Lit `html` template literal | `templateUrl` / inline template |
| Styles | `static styles` | component styles |
| Conditional rendering | template expression | `@if` / template expression |
| Lifecycle | `connectedCallback` / `disconnectedCallback` | Angular lifecycle hooks |

## Diagram

```text
LIT

hydro-app
  -> @property
sensor-card

station-selector
  -> CustomEvent
hydro-app


ANGULAR

AppComponent
  -> input
SensorCardComponent

StationSelectorComponent
  -> output
AppComponent
```

## Sensor Card

Lit receives public data with `@property`, calculates `WARNING` or `NORMAL` in `render()`, returns a Lit `html` template literal, and keeps styles in `static styles`.

Angular can express the same component as a standalone component with `input()` for public inputs and `computed()` for the derived status:

```ts
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
```

Complete example: `examples/angular-comparison/sensor-card/`.

## Station Selector

Lit uses properties for parent-to-child data and a DOM event for child-to-parent communication:

```ts
new CustomEvent('station-selected', {
  detail: { stationId },
  bubbles: true,
  composed: true,
});
```

Angular uses inputs and outputs:

```ts
stations = input<Station[]>([]);
selectedStationId = input('');
stationSelected = output<string>();

this.stationSelected.emit(stationId);
```

Lit/Web Components require thinking about DOM events and Shadow DOM boundaries. Angular uses the framework output system.

Complete example: `examples/angular-comparison/station-selector/`.

## property vs Angular input

In Lit, `@property()` declares public reactive data received from a parent:

```ts
@property()
label = '';
```

In Angular, `input()` expresses the same parent-to-child direction:

```ts
label = input('');
```

Both represent data flowing from parent to child, but the syntax and reactivity model are different.

## state vs signal

In Lit, internal reactive state can be modeled with `@state`:

```ts
@state()
private selectedStationId = '';
```

In Angular, component-owned state can be modeled with a signal:

```ts
selectedStationId = signal('');
```

Both represent internal reactive state. Lit updates through reactive properties; Angular signals are explicit reactive values that are read by calling them.

## Derived State

HydroMonitor Lab currently derives `selectedStationAlarms` with `filter()` instead of duplicating state.

Angular could express the same idea with `computed()`:

```ts
selectedStationAlarms = computed(() =>
  this.alarms().filter(
    (alarm) => alarm.stationId === this.selectedStationId(),
  ),
);
```

The important decision is the same in both frameworks: avoid duplicated state when a value can be derived cheaply.

## Services And HTTP

HydroMonitor Lab imports `StationService` directly from an ES module:

```ts
const stations = await StationService.getStations(signal);
```

Angular typically uses dependency injection:

```ts
private stationService = inject(StationService);
```

With HTTP, the Lit/vanilla implementation uses `fetch()` and returns Promises. Angular commonly uses `HttpClient`, which integrates with DI and returns Observables:

```ts
getStations(): Observable<Station[]> {
  return this.http.get<Station[]>('/api/stations');
}
```

## Promise vs Observable

HydroMonitor Lab uses `Promise`, `async` / `await`, and `fetch()` for REST calls. Angular often uses `Observable`, `HttpClient`, and RxJS, which are useful for streams, cancellation patterns, and composition.

This does not make one approach universally better. It reflects the conventions of each tool.

## AbortController vs switchMap

HydroMonitor Lab solves stale station requests with `AbortController`:

```text
station changes
  -> AbortController
  -> old request cancelled
```

Angular/RxJS often solves the same user-facing problem with `switchMap()`:

```text
station selection stream
  -> switchMap()
  -> previous inner request unsubscribed/cancelled
```

They are not identical internally, but both support the same product behavior: latest selection wins.

## SSE In Angular

`EventSource` is still a browser API in Angular. An Angular service could encapsulate it, close the connection during teardown, and expose measurements as an `Observable<Measurement>`.

Example: `examples/angular-comparison/services/realtime.service.ts`.

## Alarm Engine

`evaluateMeasurement()` is a pure domain function. Because it is not tied to Lit rendering, it would not need to change just because the UI framework changed.

```text
Lit UI
  -> evaluateMeasurement()

Angular UI
  -> evaluateMeasurement()

same domain logic
```

This separation is one of the strongest parts of the project architecture.

## Testing

HydroMonitor Lab uses Jest for business logic and service behavior, and Cypress for browser flows. In an Angular implementation, business logic tests could remain very similar, while component tests would change to match Angular's testing tools and templates.

## Trade-offs

Lit is lightweight, standards-oriented, strongly aligned with Web Components, and has a smaller abstraction layer.

Angular is a full framework with dependency injection, routing/forms/http conventions, RxJS integration, and stronger architectural defaults.

Neither is simply better. Lit fits focused Web Component-driven interfaces well; Angular fits larger convention-heavy applications well.

## Interview answers

### How would you compare Lit and Angular?

Lit is a lightweight Web Components library, while Angular is a full application framework. The trade-off is flexibility and standards alignment versus stronger framework conventions and built-in infrastructure.

### How would you translate property to Angular?

Lit `@property` maps conceptually to Angular `input()` or `@Input()`. In both cases, the parent passes data into the child component.

### How would you handle internal state?

In Lit I would use `@state` for private reactive state. In Angular I could use signals or normal component state depending on how reactive the value needs to be.

### How would you handle child-to-parent communication?

In Lit/Web Components I would dispatch a `CustomEvent`, considering `bubbles` and `composed` for Shadow DOM. In Angular I would expose an `output()` and call `.emit()`.

### How would you prevent stale requests?

In HydroMonitor Lab I use `AbortController` when the selected station changes. In Angular/RxJS I would often model station selections as a stream and use `switchMap()` so the latest selection wins.

### Would the alarm engine need to change?

No. Because the alarm engine is pure domain logic, it can be reused from either Lit or Angular UI code.
