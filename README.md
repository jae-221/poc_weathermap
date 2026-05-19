# Weather Map POC

React + TypeScript proof of concept for rendering weather data on Google Maps as a heatmap layer.

This document is written as a handoff guide for Junior developers. Read it from top to bottom before changing the codebase.

---

## What This Project Does

The app displays:

- A Google Map centered on Bangkok.
- Mock weather data rendered as a Google Maps Heatmap Layer.
- Basic loading and error messages for missing API keys, Google Maps load failures, empty weather data, and visualization library readiness.

The project intentionally uses mock data first. Real weather API integration should be added later after the map and heatmap flow is stable.

---

## Tech Stack

- React
- TypeScript
- Vite
- `@vis.gl/react-google-maps`
- Google Maps JavaScript API
- Google Maps Visualization Library

Important note: Google has deprecated the Heatmap Layer functionality. It still works for this POC, but future production work should evaluate an alternative visualization approach if Google removes it.

---

## Setup

Install dependencies:

```bash
npm install
```

Create a local `.env` file:

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Run the dev server:

```bash
npm run dev
```

Build the app:

```bash
npm run build
```

The `.env` file is ignored by Git. Do not commit API keys.

---

## Project Structure

```txt
src/
├── app/
│   ├── App.tsx
│   └── App.css
│
├── components/
│   └── common/
│
├── config/
│   └── env.ts
│
├── features/
│   └── weather-map/
│       ├── components/
│       │   ├── WeatherMap.tsx
│       │   ├── WeatherMap.css
│       │   └── WeatherHeatmapLayer.tsx
│       │
│       ├── data/
│       │   └── mockWeatherPoints.ts
│       │
│       ├── types/
│       │   └── weatherMap.types.ts
│       │
│       └── index.ts
│
├── styles/
│   └── global.css
│
└── main.tsx
```

The architecture is feature-based. Code related to the weather map should stay inside `src/features/weather-map`.

---

## File Responsibilities

### `src/main.tsx`

React entry point. It imports global CSS and renders the app.

### `src/app/App.tsx`

Top-level layout only.

It is responsible for:

- Page shell.
- Page title and short description.
- Rendering the weather-map feature.

It should not contain:

- Google Maps logic.
- Heatmap logic.
- Mock weather data.

Import the feature through:

```ts
import { WeatherMap } from '../features/weather-map'
```

### `src/app/App.css`

Page-level layout styles.

It controls:

- Page width.
- Header spacing.
- Map panel border and responsive behavior.

### `src/styles/global.css`

Global styles and CSS variables.

It controls:

- Color tokens.
- Typography defaults.
- Light and dark color variables.
- Body and root defaults.

### `src/config/env.ts`

Single place for reading Vite environment variables.

```ts
export const env = {
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
}
```

Components should import from this file instead of reading `import.meta.env` directly.

### `src/features/weather-map/index.ts`

Feature export boundary.

App-level code should import from this file, not from internal feature components.

```ts
export { WeatherMap } from './components/WeatherMap'
```

### `src/features/weather-map/components/WeatherMap.tsx`

Main feature component.

It is responsible for:

- Checking whether the Google Maps API key exists.
- Rendering `APIProvider`.
- Rendering `Map`.
- Setting the default center to Bangkok.
- Setting the default zoom.
- Passing mock weather points to `WeatherHeatmapLayer`.
- Showing a readable message if Google Maps cannot load.

Default center:

```ts
const defaultCenter = {
  lat: 13.7563,
  lng: 100.5018,
}
```

### `src/features/weather-map/components/WeatherMap.css`

Map-specific styles.

The most important rule is that the map frame must have a real height:

```css
.weather-map-frame {
  height: min(64vh, 640px);
  min-height: 420px;
}
```

Google Maps needs a parent with a real height. Using only `min-height` on the map itself can produce an empty map container.

### `src/features/weather-map/components/WeatherHeatmapLayer.tsx`

Heatmap layer component.

It is responsible for:

- Reading the current map instance with `useMap()`.
- Loading Google Maps core and visualization libraries with `useMapsLibrary()`.
- Converting `WeatherPoint[]` into Google Maps weighted locations.
- Creating `visualization.HeatmapLayer`.
- Attaching the heatmap layer to the map.
- Cleaning up with `heatmapLayer.setMap(null)`.
- Showing short status messages when data, map, or visualization library is not ready.

This component returns `null` after the heatmap is successfully attached because Google Maps owns the actual layer rendering.

### `src/features/weather-map/types/weatherMap.types.ts`

Feature-specific TypeScript types.

```ts
export type WeatherPoint = {
  lat: number
  lng: number
  weight: number
}
```

### `src/features/weather-map/data/mockWeatherPoints.ts`

Temporary mock weather data for the POC.

Each point has:

- `lat`: latitude.
- `lng`: longitude.
- `weight`: heatmap intensity.

Later, real API data should be transformed into the same `WeatherPoint` shape before reaching UI components.

---

## Data Flow

```txt
main.tsx
  ↓
App.tsx
  ↓
features/weather-map/index.ts
  ↓
WeatherMap.tsx
  ↓
mockWeatherPoints.ts
  ↓
WeatherHeatmapLayer.tsx
  ↓
Google Maps HeatmapLayer
```

Keep this direction. Feature code should not import from `app`.

---

## Error And Loading Behavior

The app handles these cases:

- Missing API key: `WeatherMap` shows a direct message.
- Google Maps load failure: `WeatherMap` shows a readable overlay.
- Empty weather data: `WeatherHeatmapLayer` shows a status message.
- Map not ready: `WeatherHeatmapLayer` waits and shows a status message.
- Visualization library not ready: `WeatherHeatmapLayer` waits and shows a status message.

The goal is to avoid a blank white screen or an empty map panel without context.

---

## Development Rules

Follow the rules in `Readme/Rules.md`.

Important rules:

- Use strict TypeScript.
- Avoid `any`.
- Keep Google Maps logic inside `features/weather-map`.
- Keep `App.tsx` focused on app-level layout.
- Do not hardcode API keys.
- Run `npm run build` before considering work complete.

---

## Git Workflow

Create a dedicated branch before feature or bug-fix work.

Branch naming examples:

```txt
feature/weather-heatmap-layer
fixbug/map-container-height
docs/update-readme
refactor/weather-map-components
```

Commit message format:

```txt
[feat] implemented weather heatmap layer
[fix] fixed map container height
[docs] updated junior handoff readme
```

---

## How To Continue The Project

Common next tasks:

- Add real weather API integration.
- Create a hook such as `useWeatherPoints`.
- Add filter controls for weather intensity or time range.
- Add marker popups for individual points.
- Replace deprecated Google Heatmap Layer if Google removes it.
- Add unit tests for data transformation.
- Add loading states for remote API calls.

When adding a real API, do not call it directly inside `App.tsx` or `WeatherHeatmapLayer.tsx`. Keep data fetching and transformation inside the weather-map feature.

Recommended future shape:

```txt
src/features/weather-map/
├── api/
│   └── weatherApi.ts
├── hooks/
│   └── useWeatherPoints.ts
├── data/
│   └── mockWeatherPoints.ts
```

---

## Quick Troubleshooting

### Map panel appears but map is blank

Check:

- `.env` has a valid `VITE_GOOGLE_MAPS_API_KEY`.
- Google Maps JavaScript API is enabled in Google Cloud.
- Billing is active.
- Key restrictions allow `localhost`.
- `.weather-map-frame` has a real `height`.

### Build cannot find `google`

Check `tsconfig.app.json` includes:

```json
"types": ["vite/client", "google.maps"]
```

### Heatmap does not appear

Check:

- `mockWeatherPoints` is not empty.
- `WeatherHeatmapLayer` is rendered inside `Map`.
- The visualization library has loaded.
- Browser console has no Google Maps API errors.

