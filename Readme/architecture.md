# Architecture and Project Structure

## Architecture Style

Use Feature-Based Architecture.

The main feature is:

```txt
weather-map
```

This feature is responsible for:

- Rendering Google Map
- Fetching and normalizing AviationWeather METAR GeoJSON
- Providing station-based weather data
- Rendering station weather markers
- Rendering station detail UI
- Defining feature-specific types

Legacy note: heatmap components/utilities may still exist while migration is in progress, but the target architecture for METAR data is station-based markers, not area-spreading heatmap.

---

## Target Folder Structure

```txt
src/
├── app/
│   ├── App.tsx
│   └── App.css
│
├── config/
│   └── env.ts
│
├── features/
│   └── weather-map/
│       ├── components/
│       │   ├── WeatherMap.tsx
│       │   ├── WeatherStationMarkerLayer.tsx
│       │   ├── WeatherStationMarker.tsx
│       │   └── WeatherStationDetailPanel.tsx
│       │
│       ├── config/
│       │   └── weatherLayerConfigs.ts
│       │
│       ├── hooks/
│       │   └── useMetarWeatherLayers.ts
│       │
│       ├── mappers/
│       │   ├── metarToWeatherStations.ts
│       │   └── metarWeatherConditionParsers.ts
│       │
│       ├── services/
│       │   └── aviationWeatherMetarApi.ts
│       │
│       ├── types/
│       │   └── weatherMap.types.ts
│       │
│       ├── utils/
│       │   ├── metarWeatherCodes.ts
│       │   └── weatherSeverity.ts
│       │
│       └── index.ts
│
├── styles/
│   └── global.css
│
└── main.tsx
```

Legacy files that may exist during migration:

```txt
WeatherHeatmapLayer.tsx
metarToWeatherPoints.ts
createWeatherPointClusters.ts
heatmapRadius.ts
```

Move or remove legacy heatmap code only after station marker rendering is stable.

---

## Component Responsibility

### `App.tsx`

Responsible for:

- App-level layout
- Rendering WeatherMap feature

Should NOT contain:

- Google Maps logic
- Station marker logic
- METAR parsing logic
- Weather severity logic

---

### `env.ts`

Responsible for:

- Reading environment variables
- Providing typed config values

Example:

```ts
export const env = {
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
}
```

Do not access `import.meta.env` directly inside feature components.

---

### `WeatherMap.tsx`

Responsible for:

- Rendering `APIProvider`
- Rendering `Map`
- Setting default center
- Calling the weather data hook
- Owning active weather mode state
- Passing station data to marker layer
- Showing loading, error, cache/source, and empty states
- Owning selected station state for the detail panel

---

### `WeatherStationMarkerLayer.tsx`

Responsible for:

- Rendering one marker per station
- Using exact METAR station coordinates only
- Passing selected station events up to `WeatherMap`
- Avoiding heatmap, fake points, and random spread points

---

### `WeatherStationMarker.tsx`

Responsible for:

- Rendering the selected mode for a single station
- Showing marker severity through style
- Handling Rain, Wind, Thunderstorm, and Temperature marker variants
- Handling missing values safely

---

### `WeatherStationDetailPanel.tsx`

Responsible for:

- Showing grouped station details after marker click
- Showing Station, Weather Status, Rain, Wind, Thunderstorm, Temperature, Cloud, Visibility, Raw METAR, and Observation Time
- Showing overall severity
- Handling missing values as `N/A`

---

### `aviationWeatherMetarApi.ts`

Responsible for:

- Building the AviationWeather METAR GeoJSON URL
- Fetching through the development proxy
- Normalizing GeoJSON `geometry.coordinates = [lon, lat]`
- Mapping `properties.id` to station id and `properties.site` to station name
- Keeping cache and stale-cache behavior

---

### `metarWeatherConditionParsers.ts`

Responsible for:

- Converting raw METAR fields into condition models
- Producing `RainCondition`, `WindCondition`, `ThunderstormCondition`, `TemperatureCondition`, and `CloudCondition`
- Keeping parsing logic outside React components

---

### `weatherMap.types.ts`

Responsible for:

- Feature-specific API, station, condition, and UI types

Example:

```ts
export type WeatherStation = {
  id: string
  name: string
  lat: number
  lng: number
  rain: RainCondition
  wind: WindCondition
  thunderstorm: ThunderstormCondition
  temperature: TemperatureCondition
  cloud: CloudCondition
}
```

---

## Data Flow

```txt
App.tsx
  ↓
WeatherMap.tsx
  ↓
useMetarWeatherLayers.ts
  ↓
aviationWeatherMetarApi.ts
  ↓
metarToWeatherStations.ts
  ↓
WeatherStationMarkerLayer.tsx
  ↓
WeatherStationMarker.tsx
  ↓
WeatherStationDetailPanel.tsx
```

---

## Dependency Rules

Allowed:

```txt
App → Feature
Feature Component → Feature Hook
Feature Component → Feature Config
Feature Component → Feature Types
Feature Hook → Feature Service
Feature Hook → Feature Mapper
Feature Mapper → Feature Utils
```

Avoid:

```txt
Feature → App
Common Component → Feature
Config → Feature
React Component → METAR parsing logic
React Component → severity calculation logic
```
