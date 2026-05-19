# Tasks

# Current Status

Already completed:
- Created React + TypeScript project using Vite
- Installed `@vis.gl/react-google-maps`

---

# Task 1 — Clean Project Structure

Create folders:

```txt
src/app
src/components/common
src/config
src/features/weather-map/components
src/features/weather-map/data
src/features/weather-map/types
src/styles
```

Move:

```txt
src/App.tsx
```

to:

```txt
src/app/App.tsx
```

Acceptance Criteria:
- Folder structure matches architecture
- App still runs
- No broken import paths

---

# Task 2 — Setup Environment Config

Create `.env`

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Create:

```txt
src/config/env.ts
```

Add:

```ts
export const env = {
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string
};
```

Acceptance Criteria:
- API key is read from env.ts
- No hardcoded API key
- App can access Google Maps API key correctly

---

# Task 3 — Render Basic Google Map First

Goal:
Render Google Map successfully before implementing Heatmap.

Create:

```txt
src/features/weather-map/components/WeatherMap.tsx
```

Requirements:
- Use `APIProvider`
- Use `Map`
- Use API key from `env.ts`
- Center map on Bangkok
- Default zoom around 11
- Map container must have visible height

Default center:

```ts
const defaultCenter = {
  lat: 13.7563,
  lng: 100.5018
};
```

Update:

```txt
src/app/App.tsx
```

Requirements:
- Render page title
- Render short description
- Render `WeatherMap`

Acceptance Criteria:
- Google Map renders successfully
- Map centers on Bangkok
- No TypeScript errors
- No API key hardcoded
- User can interact with map normally

---

# Task 4 — Add Basic Styling

Update:

```txt
src/styles/global.css
src/app/App.css
```

Requirements:
- Map has visible height
- Responsive layout
- Clean layout for POC

Acceptance Criteria:
- Map fully visible
- No overflow issue
- Layout looks clean

---

# Task 5 — Create Weather Types

Create:

```txt
src/features/weather-map/types/weatherMap.types.ts
```

Add:

```ts
export type WeatherPoint = {
  lat: number;
  lng: number;
  weight: number;
};
```

Acceptance Criteria:
- Type exported successfully
- Type usable across feature

---

# Task 6 — Create Mock Weather Data

Create:

```txt
src/features/weather-map/data/mockWeatherPoints.ts
```

Example:

```ts
import type { WeatherPoint } from "../types/weatherMap.types";

export const mockWeatherPoints: WeatherPoint[] = [
  { lat: 13.7563, lng: 100.5018, weight: 0.8 },
  { lat: 13.7367, lng: 100.5231, weight: 0.6 },
  { lat: 13.7200, lng: 100.5300, weight: 0.9 },
  { lat: 13.7650, lng: 100.5380, weight: 0.7 }
];
```

Acceptance Criteria:
- Mock data available
- All items contain lat/lng/weight

---

# Task 7 — Create WeatherHeatmapLayer Component

Create:

```txt
src/features/weather-map/components/WeatherHeatmapLayer.tsx
```

Requirements:
- Accept `points: WeatherPoint[]`
- Use `useMap()`
- Use `useMapsLibrary("visualization")`
- Create `google.maps.visualization.HeatmapLayer`
- Convert weather points into heatmap points
- Set heatmap data
- Cleanup on unmount

Acceptance Criteria:
- Heatmap layer appears correctly
- No duplicate heatmap layers
- Cleanup works correctly

---

# Task 8 — Integrate Heatmap Into WeatherMap

Update:

```txt
src/features/weather-map/components/WeatherMap.tsx
```

Requirements:
- Import mock weather data
- Render `WeatherHeatmapLayer`
- Pass weather points into heatmap component

Acceptance Criteria:
- Heatmap visible on map
- Heatmap updates correctly
- No runtime errors

---

# Task 9 — Create Feature Export

Create:

```txt
src/features/weather-map/index.ts
```

Export:

```ts
export { WeatherMap } from "./components/WeatherMap";
```

Acceptance Criteria:
- Feature import works correctly

---

# Task 10 — Add Error Handling

Handle:
- Missing API key
- Empty weather data
- Visualization library not ready
- Map not ready

Requirements:
- Show readable UI message
- Prevent app crash

Acceptance Criteria:
- App handles errors gracefully
- No blank white screen

---

# Task 11 — Build Validation

Run:

```bash
npm run build
```

Acceptance Criteria:
- Build passes
- No TypeScript errors
- No critical warnings

---

# Expected Final Result

The application should:
- Render Google Maps
- Center on Bangkok
- Display weather heatmap
- Use mock weather data
- Follow feature-based architecture
- Be scalable for future API integration

---

# Future Enhancements

Future improvements:
- Real weather API integration
- Weather filters
- Marker popup details
- Time-based heatmap
- Unit tests
- Loading states
- Dark mode
- Custom map themes