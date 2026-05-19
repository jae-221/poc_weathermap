# Tasks.md — METAR-Based Weather Heatmap Rendering

## Phase 3: Layer-Specific Heatmap Rendering

### Goal

Implement weather heatmap rendering so that each weather layer uses data from an AviationWeather METAR-style response and renders with layer-specific behavior.

Each layer must support:

- Radius
- Intensity / weight
- Gradient color
- Opacity
- Max intensity
- Zoom-based scaling
- Layer-specific data mapping

The rendered heatmap must visually match the provided weather data values and remain readable at different Google Maps zoom levels.

Reference:

- https://aviationweather.gov/help/data/#metar
- `Readme/aviationweather-heatmap-api-summary.md`
- `src/features/weather-map/data/mockResponse.json`

---

## Supported Weather Layers

The app must support:

1. Weather Radar
2. Temperature
3. Wind
4. Rain
5. Thunderstorm

Each layer must have its own:

- Data mapping logic
- Radius calculation
- Intensity calculation
- Gradient color
- Max intensity
- Opacity
- Zoom adjustment rule

---

## Task 1 — Define Shared Layer Rendering Model

### Objective

Create a reusable model for all heatmap layers.

### Tasks

- Define `WeatherLayerType`.
- Define `WeatherHeatmapPoint`.
- Define layer rendering config type.
- Support these layer ids:
  - `radar`
  - `temperature`
  - `wind`
  - `rain`
  - `thunderstorm`

### Suggested Model

```ts
export type WeatherLayerType =
  | "radar"
  | "temperature"
  | "wind"
  | "rain"
  | "thunderstorm";

export interface WeatherHeatmapPoint {
  id: string;
  lat: number;
  lng: number;
  value: number;
  unit?: string;
  temperatureC?: number;
  windKt?: number;
  gustKt?: number;
  rainfallMmHr?: number;
  radarDbz?: number;
  thunderstormSeverity?: number;
  visibilityKm?: number;
  weight?: number;
  radius?: number;
}
```

### Acceptance Criteria

- Shared types are available from the weather-map feature.
- TypeScript build passes.

---

## Task 2 — Align METAR Raw Type With AviationWeather API

### Objective

Represent the actual METAR response shape used by `mockResponse.json`.

### Tasks

- Update or create `MetarObservation`.
- Include useful METAR fields:
  - `icaoId`
  - `lat`
  - `lon`
  - `name`
  - `temp`
  - `dewp`
  - `wdir`
  - `wspd`
  - `wgst`
  - `visib`
  - `wxString`
  - `precip`
  - `cover`
  - `clouds`
  - `fltCat`
  - `rawOb`
  - `reportTime`

### Acceptance Criteria

- `mockResponse.json` can be typed safely enough for mapper usage.
- Optional fields are handled without runtime crashes.

---

## Task 3 — Use `mockResponse.json` As Main Mock Source

### Objective

Use the real API-like mock response as the source of all weather layer data.

### Tasks

- Import `src/features/weather-map/data/mockResponse.json`.
- Enable JSON import in TypeScript if needed.
- Validate observations before mapping.
- Filter out records without valid `lat` / `lon`.

### Acceptance Criteria

- The app no longer depends on hand-written `WeatherPoint[]` as the primary source.
- Build passes after importing JSON.

---

## Task 4 — Create Per-Layer METAR Mappers

### Objective

Map METAR observations into heatmap points differently for each weather layer.

### Tasks

- Create mapper functions for:
  - radar
  - temperature
  - wind
  - rain
  - thunderstorm
- Keep mapping logic separate from React components.
- Return `WeatherHeatmapPoint[]` or a compatible layer point model.

### Acceptance Criteria

- Each layer can produce its own mapped heatmap data.
- Mapper functions are testable without rendering the map.

---

## Task 5 — Define Intensity / Weight Rules

### Objective

Calculate heatmap intensity from real METAR fields.

### Suggested Rules

#### Radar

Use a composite score from:

- `wxString`
- `precip`
- `cover`
- `clouds`
- `fltCat`
- `visib`

#### Temperature

Use:

- `temp`

Normalize Celsius values into heatmap weight.

#### Wind

Use:

- `wspd`
- `wgst`

Gust should increase intensity.

#### Rain

Use:

- `precip`
- `wxString` codes such as `RA`, `SHRA`, `-RA`, `+RA`

#### Thunderstorm

Use:

- `TS`
- `VCTS`
- `TSRA`
- `wgst`
- low visibility
- `fltCat`

### Acceptance Criteria

- Each layer has a clearly documented weight calculation.
- Missing values do not produce `NaN`.

---

## Task 6 — Define Layer Gradients

### Objective

Give each layer a distinct visual style.

### Suggested Gradients

- Radar: transparent → blue → green → yellow → red
- Temperature: blue → cyan → yellow → orange → red
- Wind: cyan → blue → purple
- Rain: transparent → light blue → deep blue
- Thunderstorm: yellow → orange → red → purple

### Acceptance Criteria

- Switching layers visibly changes the heatmap color scale.
- Gradient config is not hardcoded inside the React component body.

---

## Task 7 — Define Radius And Zoom Scaling Rules

### Objective

Make radius responsive to Google Maps zoom level.

### Tasks

- Create one radius rule per layer.
- Use smaller radius when zoomed out.
- Use larger radius when zoomed in.
- Avoid country-level blobs when zoomed out.
- Avoid tiny dots when zoomed in.

### Suggested Behavior

- Temperature: wider radius, smooth field.
- Wind: medium radius, regional field.
- Rain: smaller radius, localized precipitation.
- Radar: medium dynamic radius.
- Thunderstorm: compact but strong radius.

### Acceptance Criteria

- Heatmap remains readable across zoom levels.
- Map has reasonable `minZoom` and `maxZoom`.

---

## Task 8 — Refactor `WeatherHeatmapLayer`

### Objective

Make the heatmap renderer consume layer-specific config.

### Tasks

- Pass selected layer config into `WeatherHeatmapLayer`.
- Apply:
  - `gradient`
  - `opacity`
  - `maxIntensity`
  - dynamic radius
- Update radius when `zoom_changed` fires.
- Cleanup map listeners and heatmap layer on unmount.

### Acceptance Criteria

- No duplicate heatmap layers after switching layer.
- No stale listeners after unmount.
- TypeScript build passes.

---

## Task 9 — Connect Layer Buttons To Layer Config

### Objective

Use one centralized layer config for UI and heatmap rendering.

### Tasks

- Render layer buttons from config.
- Add Thunderstorm button.
- On click, update selected layer state.
- Selected layer changes:
  - data
  - gradient
  - opacity
  - max intensity
  - radius behavior

### Acceptance Criteria

- User can switch all five layers.
- Active button state is visible.
- Heatmap visibly changes per layer.

---

## Task 10 — Validate Visual Output

### Objective

Confirm the implementation works in browser and build.

### Tasks

- Run:

```bash
npm run build
```

- Open the local app.
- Test switching:
  - Weather Radar
  - Temperature
  - Wind
  - Rain
  - Thunderstorm
- Test zoom in and zoom out.
- Check console errors.

### Acceptance Criteria

- Build passes.
- No TypeScript errors.
- No runtime error-level console logs.
- Heatmap changes style and intensity per layer.
- Zoom behavior remains readable.

---

## Future Improvements

- Replace Google HeatmapLayer with a raster/tile overlay if radar-like rendering needs to match real weather radar imagery.
- Add tooltips or station detail popups.
- Add timestamp display from METAR `reportTime`.
- Add real API fetch behind a service layer.
- Add tests for mapper normalization rules.
