# Project Rules

## Project Goal

This project is a React + TypeScript POC for rendering a Weather Map using Google Maps and Heatmap visualization.

The app must:
- Render Google Maps on a web page.
- Use `@vis.gl/react-google-maps`.
- Display mock weather data as a heatmap layer.
- Keep code clean, modular, and easy to extend.

---

## Tech Stack

- React
- TypeScript
- Vite
- @vis.gl/react-google-maps
- Google Maps JavaScript API
- Google Maps Visualization Library

---

## Coding Rules

- Use TypeScript strictly.
- Avoid `any` unless absolutely necessary.
- Prefer explicit types for props, API models, and domain models.
- Keep components small and focused.
- Do not put business logic directly inside `App.tsx`.
- Do not hardcode API keys.
- Read Google Maps API key from `.env`.
- Use feature-based folder structure.
- Keep Google Map logic inside `features/weather-map`.
- Use mock data first before integrating real API.

---

## Naming Rules

### Components

Use PascalCase.

Example:

```txt
WeatherMap.tsx
WeatherHeatmapLayer.tsx
```

---

### Hooks

Use camelCase and prefix with `use`.

Example:

```txt
useWeatherPoints.ts
```

---

### Types

Use PascalCase.

Example:

```txt
WeatherPoint
```

---

### Mock Data

Use camelCase.

Example:

```txt
mockWeatherPoints.ts
```

---

## Environment Rules

Create `.env`

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Create:

```ts
src/config/env.ts
```

```ts
export const env = {
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string
};
```

Do not access `import.meta.env` directly inside components.

---

## Git Workflow Rules

Create a dedicated branch before committing feature or bug-fix work.

Use branch names grouped by work type:

```txt
feature/<short-description>
fixbug/<short-description>
chore/<short-description>
docs/<short-description>
refactor/<short-description>
```

Examples:

```txt
feature/weather-heatmap-layer
fixbug/map-container-height
docs/update-project-rules
```

Commit messages should start with a type in square brackets, followed by a short description.

Example:

```txt
[feat] implemented weather heatmap layer
```

---

## Error Handling Rules

The app must handle:
- Missing API key.
- Empty weather data.
- Google Maps not loaded yet.
- Visualization library not loaded yet.

The app should show readable UI messages instead of crashing.

---

## Build Rules

Before considering a task complete, run:

```bash
npm run build
```

The build must pass without TypeScript errors.
