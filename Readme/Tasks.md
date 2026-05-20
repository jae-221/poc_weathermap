# Tasks.md — METAR Station-Based Weather Layers

## Context

The previous implementation used Google Maps HeatmapLayer to display weather conditions from METAR data. After visual review, the heatmap is not suitable for operational analysis because it visually spreads values into areas where no station observation exists.

This phase changes the approach from **spread heatmap visualization** to **station-based operational weather visualization**.

The system should display weather conditions exactly at the latitude/longitude of each METAR station and avoid creating misleading weather coverage outside real observation points.

---

## Goal

Build a reliable airport ground-operator weather map using METAR data from AviationWeather API.

The app must help operators understand current airport-area weather conditions from station observations, focusing on:

- Rain
- Wind
- Thunderstorm
- Temperature
- Cloud information in the future

---

## Core Principle

METAR is station observation data.

Therefore:

- Do not render METAR as wide area weather coverage.
- Do not randomly spread points around stations.
- Do not imply weather exists in locations where there is no observation.
- Always render the station condition at the exact METAR latitude/longitude.
- Use icons, markers, badges, and local station intensity indicators instead of area-spreading heatmap.

---

## Current Problem

The old heatmap approach creates a misleading visual result because:

1. METAR observations are point-based.
2. Google HeatmapLayer visually blends station values into surrounding areas.
3. The previous clustering/spreading logic creates artificial points around stations.
4. Operators may misunderstand that the weather condition covers a wider area than the actual data supports.
5. Rain and thunderstorm should not be visualized as broad areas unless radar/raster/polygon data is used.

---

## Required Weather Modes

The app must support these modes:

```txt
Rain
Wind
Thunderstorm
Temperature
```

Future mode:

```txt
Cloud
```

Cloud mode is not required in this phase. Cloud data should be analyzed later before deciding the final visualization.

---

## Data Source

Use AviationWeather METAR GeoJSON API.

Current API example:

```txt
/api/aviationweather/metar?bbox=5.5%2C97.0%2C20.5%2C106.0&format=geojson
```

The app should continue using the existing Vite proxy during development.

Important GeoJSON rule:

```txt
geometry.coordinates = [longitude, latitude]
```

Convert it to:

```ts
{
  lat: coordinates[1],
  lng: coordinates[0]
}
```

---

## METAR Fields to Use

### Location

Use:

- `geometry.coordinates`
- `properties.id`
- `properties.site`

### Rain

Use:

- `properties.wx`
- `properties.rawOb`
- `properties.visib`
- `properties.fltcat`

Rain-related METAR codes:

```txt
-RA
RA
+RA
SHRA
-SHRA
+SHRA
VCSH
RERA
TSRA
-TSRA
+TSRA
```

### Wind

Use:

- `properties.wdir`
- `properties.wspd`
- `properties.wgst`
- `properties.rawOb`

Wind notes:

- `wdir` can be a number such as `210`
- `wdir` can also be `"VRB"`
- `wspd` is in knots
- `wgst` may be null

### Thunderstorm

Use:

- `properties.wx`
- `properties.rawOb`
- `properties.clouds`

Thunderstorm-related signals:

```txt
TS
TSRA
-TSRA
+TSRA
VCTS
CB
TCU
```

Important:

Even when `wx` is null, `rawOb` or cloud layers may contain `CB` or `TCU`. These should be treated as convective risk signals.

### Temperature

Use:

- `properties.temp`
- `properties.dewp`

---

## Required UI Behavior

### Layer Selector

The UI must show selectable modes:

```txt
Rain | Wind | Thunderstorm | Temp
```

Only one mode needs to be active at a time for this phase.

### Station Marker Rendering

Each station must be rendered as a marker at its actual latitude/longitude.

Do not use random cluster points around the station.

Each marker should represent the selected mode.

Examples:

- Rain mode: weather icon marker
- Wind mode: wind arrow marker
- Thunderstorm mode: warning/thunder marker
- Temperature mode: temperature badge marker

### Marker Click Behavior

When a user clicks a station marker, show a detail view.

The detail view must group information by category:

```txt
Station
Weather Status
Rain
Wind
Thunderstorm
Temperature
Cloud
Visibility
Raw METAR
Observation Time
```

The detail view must also show a severity status.

Example severity:

```txt
Normal
Caution
Warning
Critical
```

### Severity Display

Severity must be visible in both:

1. Marker styling
2. Detail view

---

## Rain Mode Requirement

When Rain mode is selected:

- Render one marker per station.
- Use an icon based on weather condition.
- Do not render wide heatmap blobs.
- Do not create fake points around the station.
- Use color to indicate severity.

Suggested icons:

| Condition | Icon Meaning |
|---|---|
| No rain | Cloud / clear cloud |
| `VCSH` | Nearby shower |
| `-RA` | Light rain |
| `RA` | Rain |
| `+RA` | Heavy rain |
| `TSRA`, `+TSRA` | Thunderstorm rain |
| `RERA` | Recent rain |

Suggested severity:

| Condition | Severity |
|---|---|
| No rain | Normal |
| `VCSH`, `RERA` | Caution |
| `-RA`, `RA`, `SHRA` | Warning |
| `+RA`, `TSRA`, `+TSRA` | Critical |

Output model should include:

```ts
type RainCondition = {
  type: 'none' | 'nearby_shower' | 'recent_rain' | 'light_rain' | 'rain' | 'heavy_rain' | 'thunderstorm_rain';
  severity: 'normal' | 'caution' | 'warning' | 'critical';
  label: string;
  icon: string;
};
```

---

## Wind Mode Requirement

When Wind mode is selected:

- Render one marker per station.
- Show wind direction using an arrow.
- Show wind speed using label or marker size.
- Show gust if available.
- Handle `VRB` direction safely.

Suggested severity:

| Wind Speed | Severity |
|---|---|
| `< 10 kt` | Normal |
| `10 - 19 kt` | Caution |
| `20 - 29 kt` | Warning |
| `>= 30 kt` | Critical |

If gust exists, severity should consider the higher value between `wspd` and `wgst`.

Output model should include:

```ts
type WindCondition = {
  direction: number | 'VRB' | null;
  speedKt: number | null;
  gustKt: number | null;
  severity: 'normal' | 'caution' | 'warning' | 'critical';
  label: string;
};
```

---

## Thunderstorm Mode Requirement

When Thunderstorm mode is selected:

- Render one marker per station.
- Detect thunderstorm from `wx`, `rawOb`, and cloud information.
- Show stronger warning for actual TS weather.
- Show caution/warning for CB or TCU cloud signal even if `wx` is null.

Suggested detection:

| Signal | Meaning | Severity |
|---|---|---|
| No TS/CB/TCU | No convective signal | Normal |
| `TCU` | Towering cumulus | Caution |
| `CB` | Cumulonimbus | Warning |
| `VCTS` | Thunderstorm nearby | Warning |
| `TSRA`, `+TSRA` | Active thunderstorm rain | Critical |

Output model should include:

```ts
type ThunderstormCondition = {
  detected: boolean;
  source: 'wx' | 'rawOb' | 'clouds' | 'none';
  severity: 'normal' | 'caution' | 'warning' | 'critical';
  label: string;
};
```

---

## Temperature Mode Requirement

When Temperature mode is selected:

- Render one marker per station.
- Show temperature value in Celsius.
- Use color or badge severity based on temperature.
- Do not use wide heatmap spreading.

Suggested severity for Thailand POC:

| Temperature | Severity |
|---|---|
| `< 30°C` | Normal |
| `30 - 34°C` | Caution |
| `35 - 38°C` | Warning |
| `>= 39°C` | Critical |

Output model should include:

```ts
type TemperatureCondition = {
  tempC: number | null;
  dewpointC: number | null;
  severity: 'normal' | 'caution' | 'warning' | 'critical';
  label: string;
};
```

---

## Cloud Data Requirement for Future Phase

Cloud mode is not required now.

However, the model should keep cloud data available for detail view.

Use:

- `cover`
- `ceil`
- `clouds[].cover`
- `clouds[].base`
- `rawOb`

Potential future display:

- Cloud coverage badge
- Ceiling risk
- CB/TCU convective cloud alert
- Cloud layer list in detail panel

---

## Target Folder Structure

Update the current feature structure to support station-based visualization.

```txt
src/features/weather-map/
├── components/
│   ├── WeatherMap.tsx
│   ├── WeatherMap.css
│   ├── WeatherStationMarkerLayer.tsx
│   ├── WeatherStationMarker.tsx
│   └── WeatherStationDetailPanel.tsx
│
├── config/
│   └── weatherLayerConfigs.ts
│
├── hooks/
│   └── useMetarWeatherLayers.ts
│
├── mappers/
│   ├── metarToWeatherStations.ts
│   └── metarWeatherConditionParsers.ts
│
├── services/
│   └── aviationWeatherMetarApi.ts
│
├── types/
│   └── weatherMap.types.ts
│
├── utils/
│   ├── weatherSeverity.ts
│   └── metarWeatherCodes.ts
│
└── index.ts
```

Existing files that may be deprecated later:

```txt
WeatherHeatmapLayer.tsx
createWeatherPointClusters.ts
heatmapRadius.ts
```

Do not delete them immediately unless the current feature no longer imports them.

---

# Implementation Tasks

## Phase 4.1 — Update Requirement Documentation

### Goal

Update project documentation to clearly state that METAR data must be rendered as station-based weather markers, not as wide heatmap coverage.

### Tasks

1. Update `Tasks.md` with this phase.
2. Add a note that Google HeatmapLayer may remain only as legacy POC code.
3. Add a note that radar-like visualization requires radar/raster/tile provider, not METAR.
4. Add a note that station points must use real API coordinates only.

### Test

No UI test required.

Run:

```bash
npm run build
```

Expected:

- Project still builds.
- No runtime behavior change required.

---

## Phase 4.2 — Create Station-Based Domain Types

### Goal

Create types for station-based weather rendering.

### Files

Update:

```txt
src/features/weather-map/types/weatherMap.types.ts
```

### Tasks

Add or update types:

```ts
export type WeatherLayerType =
  | 'rain'
  | 'wind'
  | 'thunderstorm'
  | 'temperature';

export type WeatherSeverity =
  | 'normal'
  | 'caution'
  | 'warning'
  | 'critical';

export type WeatherStation = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  observationTime: string | null;
  rawOb: string | null;
  flightCategory: string | null;
  visibility: string | number | null;
  rain: RainCondition;
  wind: WindCondition;
  thunderstorm: ThunderstormCondition;
  temperature: TemperatureCondition;
  cloud: CloudCondition;
};

export type RainCondition = {
  type:
    | 'none'
    | 'nearby_shower'
    | 'recent_rain'
    | 'light_rain'
    | 'rain'
    | 'heavy_rain'
    | 'thunderstorm_rain';
  severity: WeatherSeverity;
  label: string;
  icon: string;
};

export type WindCondition = {
  direction: number | 'VRB' | null;
  speedKt: number | null;
  gustKt: number | null;
  severity: WeatherSeverity;
  label: string;
};

export type ThunderstormCondition = {
  detected: boolean;
  source: 'wx' | 'rawOb' | 'clouds' | 'none';
  severity: WeatherSeverity;
  label: string;
};

export type TemperatureCondition = {
  tempC: number | null;
  dewpointC: number | null;
  severity: WeatherSeverity;
  label: string;
};

export type CloudCondition = {
  cover: string | null;
  ceilingFt: number | null;
  layers: Array<{
    cover: string;
    base: number | null;
  }>;
  hasCb: boolean;
  hasTcu: boolean;
};
```

### Test

Run:

```bash
npm run build
```

Expected:

- TypeScript passes.
- No UI change yet.

---

## Phase 4.3 — Add METAR Weather Code Utilities

### Goal

Centralize METAR code detection.

### Files

Create:

```txt
src/features/weather-map/utils/metarWeatherCodes.ts
```

### Tasks

Implement pure utility functions:

```ts
export function normalizeWeatherText(value: string | null | undefined): string;

export function hasRainSignal(wx: string | null, rawOb: string | null): boolean;

export function hasThunderstormSignal(wx: string | null, rawOb: string | null): boolean;

export function hasCbSignal(rawOb: string | null): boolean;

export function hasTcuSignal(rawOb: string | null): boolean;

export function hasNearbySignal(wx: string | null, rawOb: string | null): boolean;

export function hasRecentRainSignal(wx: string | null, rawOb: string | null): boolean;
```

Rules:

- Must handle null safely.
- Must not throw if `wx` is missing.
- Must check both `wx` and `rawOb` where needed.
- Must avoid false positives where possible.

### Test

Temporarily log parser result for a few observations or add small local test calls in development.

Run:

```bash
npm run build
```

Expected:

- No TypeScript error.
- Utilities are importable.

---

## Phase 4.4 — Add Severity Utility

### Goal

Centralize severity logic.

### Files

Create:

```txt
src/features/weather-map/utils/weatherSeverity.ts
```

### Tasks

Implement:

```ts
export function getWindSeverity(speedKt: number | null, gustKt: number | null): WeatherSeverity;

export function getTemperatureSeverity(tempC: number | null): WeatherSeverity;

export function getRainSeverity(wx: string | null, rawOb: string | null): WeatherSeverity;

export function getThunderstormSeverity(params: {
  wx: string | null;
  rawOb: string | null;
  hasCb: boolean;
  hasTcu: boolean;
}): WeatherSeverity;
```

### Test

Run:

```bash
npm run build
```

Expected:

- Build passes.
- No UI change yet.

---

## Phase 4.5 — Create METAR Condition Parsers

### Goal

Convert raw METAR fields into Rain, Wind, Thunderstorm, Temperature, and Cloud condition models.

### Files

Create:

```txt
src/features/weather-map/mappers/metarWeatherConditionParsers.ts
```

### Tasks

Implement:

```ts
export function parseRainCondition(params: {
  wx: string | null;
  rawOb: string | null;
}): RainCondition;

export function parseWindCondition(params: {
  wdir: number | 'VRB' | null;
  wspd: number | null;
  wgst: number | null;
}): WindCondition;

export function parseThunderstormCondition(params: {
  wx: string | null;
  rawOb: string | null;
  clouds: Array<{ cover: string; base: number | null }>;
}): ThunderstormCondition;

export function parseTemperatureCondition(params: {
  temp: number | null;
  dewp: number | null;
}): TemperatureCondition;

export function parseCloudCondition(params: {
  cover: string | null;
  ceil: number | null;
  clouds: Array<{ cover: string; base: number | null }>;
  rawOb: string | null;
}): CloudCondition;
```

### Test

Run:

```bash
npm run build
```

Expected:

- Parser compiles.
- No UI change yet.

---

## Phase 4.6 — Map METAR Observations to Weather Stations

### Goal

Create station-based view models from METAR observations.

### Files

Create:

```txt
src/features/weather-map/mappers/metarToWeatherStations.ts
```

### Tasks

Implement:

```ts
export function metarToWeatherStations(
  observations: MetarObservation[]
): WeatherStation[];
```

Rules:

- Use real API latitude and longitude only.
- Do not create additional artificial points.
- Skip observation if lat/lng is missing.
- Preserve raw METAR.
- Preserve station ID and site name.
- Map all condition groups using parser functions.

### Test

Temporarily render station count in UI or console:

```txt
Stations: 38
```

Run:

```bash
npm run build
npm run dev
```

Expected:

- App loads.
- Console/UI shows station count.
- No map marker required yet.

---

## Phase 4.7 — Update Hook to Return Weather Stations

### Goal

Update data lifecycle hook to provide station-based data.

### Files

Update:

```txt
src/features/weather-map/hooks/useMetarWeatherLayers.ts
```

### Tasks

1. Keep existing API fetch behavior.
2. Keep cache behavior.
3. Convert observations to `WeatherStation[]`.
4. Return stations from the hook.

Suggested return:

```ts
return {
  observations,
  stations,
  source,
  status,
  error,
};
```

Do not remove old layer output until marker rendering works unless it causes type conflict.

### Test

Run:

```bash
npm run build
npm run dev
```

Expected:

- App loads.
- Existing UI should not break.
- Station count is available from hook.

---

## Phase 4.8 — Replace Layer Config with Station Mode Config

### Goal

Simplify layer config to match only supported modes.

### Files

Update:

```txt
src/features/weather-map/config/weatherLayerConfigs.ts
```

### Tasks

Define config for:

```txt
rain
wind
thunderstorm
temperature
```

Suggested config:

```ts
export type WeatherLayerConfig = {
  id: WeatherLayerType;
  label: string;
  description: string;
};
```

Remove or disable:

```txt
visibility
fog
cloudCoverage
weatherRadar
```

Cloud should remain future only.

### Test

Run:

```bash
npm run build
npm run dev
```

Expected:

- UI shows only Rain, Wind, Thunderstorm, Temp.
- Selecting each mode updates active mode state.
- No marker rendering required yet.

---

## Phase 4.9 — Create Weather Station Marker Layer

### Goal

Render one marker per METAR station.

### Files

Create:

```txt
src/features/weather-map/components/WeatherStationMarkerLayer.tsx
src/features/weather-map/components/WeatherStationMarker.tsx
```

### Tasks

1. Use station array from hook.
2. Render markers at exact station lat/lng.
3. Marker output should change by selected mode.
4. Do not use HeatmapLayer.
5. Do not use artificial cluster points.

Recommended approach:

Use `AdvancedMarker` if available from `@vis.gl/react-google-maps`.

Example conceptual props:

```ts
type WeatherStationMarkerLayerProps = {
  stations: WeatherStation[];
  selectedLayer: WeatherLayerType;
  selectedStationId: string | null;
  onSelectStation: (station: WeatherStation) => void;
};
```

### Test

Run:

```bash
npm run build
npm run dev
```

Expected:

- Map renders.
- One marker appears per station.
- Marker is located at the correct station coordinate.
- No heatmap spreading appears.

---

## Phase 4.10 — Implement Rain Marker Icons

### Goal

Rain mode must show weather icons based on station condition.

### Files

Update:

```txt
src/features/weather-map/components/WeatherStationMarker.tsx
src/features/weather-map/components/WeatherMap.css
```

### Tasks

When selected layer is `rain`:

- Show cloud icon for no rain.
- Show shower/rain icon for rain conditions.
- Show thunderstorm icon for thunderstorm rain.
- Use severity class for marker color.

Example CSS classes:

```txt
.weather-marker--normal
.weather-marker--caution
.weather-marker--warning
.weather-marker--critical
```

### Test

Run:

```bash
npm run build
npm run dev
```

Expected:

- Rain mode shows station icons.
- Stations with `-RA`, `RA`, `+RA`, `TSRA` visually differ.
- Markers do not spread beyond station coordinate.

---

## Phase 4.11 — Implement Wind Marker

### Goal

Wind mode must show wind direction and speed.

### Files

Update:

```txt
WeatherStationMarker.tsx
WeatherMap.css
```

### Tasks

When selected layer is `wind`:

- Show arrow icon.
- Rotate arrow using `wdir` if numeric.
- If `wdir` is `VRB`, show `VRB` badge instead of rotation.
- Show speed in knots.
- Use gust if available in detail view.

### Test

Run:

```bash
npm run build
npm run dev
```

Expected:

- Wind mode shows arrows.
- Numeric wind direction rotates marker.
- `VRB` does not crash UI.
- Speed is visible.

---

## Phase 4.12 — Implement Thunderstorm Marker

### Goal

Thunderstorm mode must highlight convective risk.

### Files

Update:

```txt
WeatherStationMarker.tsx
WeatherMap.css
```

### Tasks

When selected layer is `thunderstorm`:

- Show normal marker when no signal.
- Show caution/warning marker when `TCU` or `CB` is detected.
- Show critical marker for active `TSRA` or `+TSRA`.
- Use source label in detail panel later.

### Test

Run:

```bash
npm run build
npm run dev
```

Expected:

- Stations with TS/CB/TCU are visibly highlighted.
- Stations without signal remain low emphasis.
- Marker count stays equal to station count.

---

## Phase 4.13 — Implement Temperature Marker

### Goal

Temperature mode must show actual station temperature.

### Files

Update:

```txt
WeatherStationMarker.tsx
WeatherMap.css
```

### Tasks

When selected layer is `temperature`:

- Show temperature badge such as `33°C`.
- Use severity class based on configured threshold.
- Show dew point later in detail panel.

### Test

Run:

```bash
npm run build
npm run dev
```

Expected:

- Temperature mode shows temperature per station.
- Missing temperature is handled safely.
- No UI crash.

---

## Phase 4.14 — Add Station Detail Panel

### Goal

Clicking a station marker opens a detail view.

### Files

Create:

```txt
src/features/weather-map/components/WeatherStationDetailPanel.tsx
```

Update:

```txt
WeatherMap.tsx
WeatherMap.css
```

### Tasks

Detail panel must show:

```txt
Station
- ICAO
- Site name
- Observation time
- Flight category

Weather Status
- Overall severity

Rain
- Rain label
- Rain severity

Wind
- Direction
- Speed
- Gust

Thunderstorm
- Detected
- Source
- Severity

Temperature
- Temperature
- Dew point

Cloud
- Cover
- Ceiling
- Cloud layers
- CB/TCU signal

Visibility
- Visibility value

Raw METAR
- rawOb
```

### Test

Run:

```bash
npm run build
npm run dev
```

Expected:

- Clicking marker opens panel.
- Panel displays station data grouped by category.
- Missing values show `N/A`.
- Raw METAR is visible.

---

## Phase 4.15 — Add Overall Station Severity

### Goal

Calculate an overall severity for each station.

### Files

Update:

```txt
metarToWeatherStations.ts
weatherMap.types.ts
weatherSeverity.ts
WeatherStationMarker.tsx
WeatherStationDetailPanel.tsx
```

### Tasks

Add:

```ts
overallSeverity: WeatherSeverity;
```

Suggested priority:

```txt
critical > warning > caution > normal
```

Overall severity should be the maximum severity among:

- Rain
- Wind
- Thunderstorm
- Temperature

### Test

Run:

```bash
npm run build
npm run dev
```

Expected:

- Detail panel shows overall severity.
- Marker border or badge reflects overall severity.
- Critical stations are visually obvious.

---

## Phase 4.16 — Remove Old Heatmap Rendering from Active Flow

### Goal

Stop using heatmap as the active display method.

### Files

Update:

```txt
WeatherMap.tsx
```

### Tasks

1. Remove `WeatherHeatmapLayer` from active rendering.
2. Use `WeatherStationMarkerLayer` instead.
3. Keep old heatmap files only if needed for reference.
4. Make sure no mode depends on `WeatherPoint[]`.

### Test

Run:

```bash
npm run build
npm run dev
```

Expected:

- No heatmap appears.
- Station markers remain visible.
- Layer switching works.
- Marker click detail panel works.

---

## Phase 4.17 — Clean Up Legacy Heatmap Types and Utilities

### Goal

Remove or isolate old heatmap-specific logic after marker flow is stable.

### Files to Review

```txt
WeatherHeatmapLayer.tsx
createWeatherPointClusters.ts
heatmapRadius.ts
metarToWeatherPoints.ts
weatherLayerConfigs.ts
weatherMap.types.ts
```

### Tasks

1. Remove unused imports.
2. Remove unused heatmap types.
3. Keep files only if they are still referenced.
4. If keeping legacy code, move it under a clearly named legacy folder.

Suggested optional folder:

```txt
src/features/weather-map/legacy/
```

### Test

Run:

```bash
npm run lint
npm run build
```

Expected:

- No unused imports.
- No TypeScript errors.
- No behavior regression.

---

## Phase 4.18 — Improve Empty and Error States

### Goal

Make the UI reliable when API data is missing or partial.

### Tasks

Handle:

- API loading
- API error
- Empty station list
- Missing `wx`
- Missing `rawOb`
- Missing `wspd`
- Missing `wdir`
- Missing `temp`
- Missing clouds
- Invalid coordinates

### Test

Temporarily mock or simulate empty response.

Expected:

- App does not crash.
- UI shows clear message.
- Map still renders where possible.

---

## Phase 4.19 — Manual Validation with Real API Data

### Goal

Validate that displayed markers match real METAR fields.

### Tasks

Use current API data and verify sample stations:

1. Station with `-RA` should show rain icon.
2. Station with `+TSRA` should show critical thunderstorm/rain.
3. Station with `VRB` wind should not crash.
4. Station with `CB` in raw METAR should show thunderstorm/convective risk.
5. Station with no rain should show normal/no-rain marker.
6. Temperature marker should match `properties.temp`.

### Test

Run:

```bash
npm run build
npm run dev
```

Expected:

- Visual output matches raw METAR data.
- No artificial weather spreading.
- Operator can inspect station detail.

---

## Phase 4.20 — Final QA Checklist

Before considering this phase complete:

```bash
npm run lint
npm run build
```

Manual checklist:

- Google Map renders.
- Only 4 modes are visible.
- Rain mode works.
- Wind mode works.
- Thunderstorm mode works.
- Temperature mode works.
- Markers use exact station coordinates.
- No artificial heatmap spreading.
- Clicking marker opens detail panel.
- Detail panel groups data clearly.
- Missing data does not crash app.
- API cache behavior still works.
- Dev proxy still works.
- Raw METAR is available for verification.

---

# Suggested Implementation Order

Use this order when asking AI/Codex to implement:

```txt
1. Types
2. Utilities
3. Parsers
4. Station mapper
5. Hook return stations
6. Layer selector cleanup
7. Marker layer
8. Rain marker
9. Wind marker
10. Thunderstorm marker
11. Temperature marker
12. Detail panel
13. Remove active heatmap
14. Clean up legacy code
15. QA
```

Do not ask AI to implement everything in one prompt. Each task should be small enough to build and test immediately.
