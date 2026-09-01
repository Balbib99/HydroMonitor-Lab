# Accessibility Notes

HydroMonitor Lab uses semantic HTML where it fits the current UI: `main` for the application content, `header` for the title, `section` for grouped dashboard areas, `article` for reusable cards, and lists for alerts.

## Keyboard And Focus

The station selector is a native `select`, which keeps expected keyboard behavior. Its visible `label` is connected through `for` and `id`, and the focus style uses `:focus-visible` so keyboard users get a clear outline.

## Status And Alerts

The connection indicator exposes text such as `CONNECTED` and uses `role="status"` with `aria-live="polite"` so connection changes can be announced without interrupting the user.

The alarm panel uses a heading, a list, visible severity text, and `aria-live="polite"` for new alerts. Severity is communicated with text as well as color.

## Sensor Cards

Each sensor card exposes its label, value, unit, and current state through visible text. It also provides an accessible label with the same information, such as water level, value, unit, and whether the card is normal or warning.

## Chart Fallback

The chart remains a Canvas visualization, but it now includes an assistive-text summary linked with `aria-describedby`. The summary includes the number of measurements, latest value, and min/max range for the selected metric.

## Color

The UI does not rely on color alone. Sensor states, connection states, and alarm severities are visible as text.

This phase does not include automated axe checks, Lighthouse audits, or a full screen reader audit.
