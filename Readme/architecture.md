# Architecture and Project Structure

# Architecture Style

Use Feature-Based Architecture.

The main feature is:

```txt
weather-map
```

This feature is responsible for:
- Rendering Google Map
- Rendering Heatmap
- Providing weather data
- Defining feature types

---

# Folder Structure

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
├── main.tsx
└── vite-env.d.ts
```

---

# Component Responsibility

## App.tsx

Responsible for:
- App-level layout
- Rendering WeatherMap feature

Should NOT contain:
- Google Maps logic
- Heatmap logic
- Mock weather data

---

## env.ts

Responsible for:
- Reading environment variables
- Providing typed config values

Example:

```ts
export const env = {
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string
};
```

---

## WeatherMap.tsx

Responsible for:
- Rendering APIProvider
- Rendering Map
- Setting default center
- Passing weather data to heatmap layer

Default center:

```ts
const defaultCenter = {
  lat: 13.7563,
  lng: 100.5018
};
```

---

## WeatherHeatmapLayer.tsx

Responsible for:
- Getting current map instance
- Loading visualization library
- Creating HeatmapLayer
- Converting weather data into heatmap points
- Cleaning up heatmap layer

---

## mockWeatherPoints.ts

Responsible for:
- Providing temporary weather data for POC

---

## weatherMap.types.ts

Responsible for:
- Feature-specific types

Example:

```ts
export type WeatherPoint = {
  lat: number;
  lng: number;
  weight: number;
};
```

---

# Data Flow

```txt
App.tsx
  ↓
WeatherMap.tsx
  ↓
mockWeatherPoints.ts
  ↓
WeatherHeatmapLayer.tsx
  ↓
Google Maps HeatmapLayer
```

---

# Dependency Rules

Allowed:

```txt
App → Feature
Feature Component → Feature Data
Feature Component → Feature Types
Feature Component → Config
```

Avoid:

```txt
Feature → App
Common Component → Feature
Config → Feature
```