# Update.md — METAR API Cache Integration Handoff

## Current Branch

`feature/metar-api-cache`

This branch continues from `feature/improve-layer`.

## Goal Of This Update

Connect the weather map to AviationWeather METAR data and keep the app usable when the API is unavailable.

Requested API behavior:

- Fetch METAR observations from AviationWeather.
- Use the bbox requested by the user: `5.5,97.0,20.5,106.0`.
- Send bbox to AviationWeather in API order: `97.0,5.5,106.0,20.5`.
- Cache API data for 1 hour.
- Fall back to existing `mockResponse.json` when API data is unavailable.

## What Was Done

### 1. Added AviationWeather METAR service

File:

- `src/features/weather-map/services/aviationWeatherMetarApi.ts`

This service now owns:

- AviationWeather METAR endpoint path.
- Bbox conversion for AviationWeather.
- `localStorage` cache key.
- 1 hour cache TTL.
- API fetch.
- JSON validation.
- stale cache fallback.
- clear error when AviationWeather returns `204 No Content`.

Important constants:

```ts
METAR_CACHE_TTL_MS = 60 * 60 * 1000
METAR_CACHE_KEY = 'poc-weathermap:aviationweather:metar:bbox:5.5,97.0,20.5,106.0'
```

### 2. Added Vite dev proxy

File:

- `vite.config.ts`

The app calls:

```txt
/api/aviationweather/metar
```

Vite proxies it to:

```txt
https://aviationweather.gov/api/data/metar
```

Reason:

- Direct browser fetch to AviationWeather failed with `Failed to fetch`.
- The proxy avoids client-side CORS/network restrictions during local development.

### 3. Added hook to build weather layers from live METAR data

File:

- `src/features/weather-map/hooks/useMetarWeatherLayers.ts`

The hook:

- starts with `mockResponse.json` as initial fallback data.
- fetches/caches live METAR observations.
- builds all weather layer point data from whichever observation source is active.
- exposes current source/status/error for UI.

Layer point generation still uses:

- `src/features/weather-map/mappers/metarToWeatherPoints.ts`

### 4. Connected WeatherMap to API-backed layers

File:

- `src/features/weather-map/components/WeatherMap.tsx`

`WeatherMap` now uses:

```ts
useMetarWeatherLayers()
```

instead of rendering only static `weatherLayerConfigs` data.

The UI now shows a small status label on the map:

- `Loading METAR data`
- `Live METAR API`
- `Cached METAR data`
- `Stale METAR cache`
- `Mock METAR fallback`

### 5. Added weather data status styling

File:

- `src/features/weather-map/components/WeatherMap.css`

Added `.weather-data-status` for the source/status badge near the bottom-left of the map.

### 6. Reused METAR validation for mock data

File:

- `src/features/weather-map/data/metarMockResponse.ts`

Mock JSON validation now reuses:

```ts
isValidMetarObservation()
```

from the API service.

### 7. Tuned Weather Radar mapping

Files:

- `src/features/weather-map/mappers/metarToWeatherPoints.ts`
- `src/features/weather-map/config/weatherLayerConfigs.ts`

Weather Radar was adjusted to behave more like rain/storm radar instead of broad weather severity.

Radar now prioritizes:

- `RA`
- `SHRA`
- `DZ`
- `VCSH`
- `TS`
- `VCTS`
- `TSRA`
- `CB`
- `TCU`
- low visibility with active weather signal

Radar now reduces influence from:

- general cloud cover only
- broad flight category only
- haze/fog-only signals

Radar radius was also reduced:

```ts
geographic: 0.32
```

## Current Runtime Behavior

Data loading order:

1. Try fresh `localStorage` cache first.
2. If no fresh cache, fetch live METAR data.
3. If API succeeds, save it to cache for 1 hour.
4. If API fails, try stale cache.
5. If there is no usable cache, fallback to `mockResponse.json`.

Current local test result:

- `npm run build` passes.
- Vite proxy works technically.
- AviationWeather returned `204 No Content` for the requested bbox during test time.
- App correctly fell back to `mockResponse.json`.
- No browser console error-level logs were observed.

## Important Note About Bbox

User-provided bbox:

```txt
5.5,97.0,20.5,106.0
```

This looks like:

```txt
minLat,minLon,maxLat,maxLon
```

AviationWeather expects:

```txt
minLon,minLat,maxLon,maxLat
```

So the actual request is:

```txt
97.0,5.5,106.0,20.5
```

## Known Limitation

The production build will call `/api/aviationweather/metar` too, but the current proxy exists only in Vite dev server.

For production deployment, another proxy/server/API route is needed.

Suggested options:

- backend endpoint such as `/api/weather/metar`
- serverless function
- deployment platform rewrite/proxy
- move API fetch to a backend service

## Validation Already Done

Commands run:

```bash
npm run build
```

Result:

- TypeScript build passed.
- Vite build passed.

Manual/browser checks:

- App loads.
- Weather layer buttons still render.
- Status badge renders.
- API fallback path renders `Mock METAR fallback`.
- No error-level console logs were found in browser verification.

## What To Do Next

### Task 1 — Confirm AviationWeather bbox behavior

Verify whether AviationWeather should receive:

```txt
97.0,5.5,106.0,20.5
```

or whether the API behaves differently for non-US bbox queries.

During the test, AviationWeather returned:

```txt
204 No Content
```

for:

```txt
/api/data/metar?bbox=97.0,5.5,106.0,20.5&format=json
```

### Task 2 — Decide production API strategy

The current Vite proxy is development-only.

Before production use, add a real backend/proxy endpoint.

### Task 3 — Improve API status UX

Current status is compact and developer-oriented.

Potential improvements:

- show last updated time.
- show cache expiry time.
- show source tooltip.
- avoid showing `API unavailable` if fallback is expected during development.

### Task 4 — Add tests for API/cache service

Recommended coverage:

- fresh cache returns immediately.
- expired cache triggers fetch.
- API success writes cache.
- API `204 No Content` falls back correctly.
- failed API uses stale cache.
- failed API without cache uses mock fallback through hook.

### Task 5 — Revisit Weather Radar data source

Current Weather Radar is still inferred from METAR, not true radar reflectivity.

For real radar behavior, use one of:

- radar tile overlay.
- precipitation raster.
- reflectivity dBZ data.
- weather provider radar API.

Until then, consider renaming UI layer to:

```txt
Precipitation / Storm
```

or keep `Weather Radar` as a POC label only.

## Files Changed In This Branch

Expected changed files:

- `Update.md`
- `vite.config.ts`
- `src/features/weather-map/components/WeatherMap.tsx`
- `src/features/weather-map/components/WeatherMap.css`
- `src/features/weather-map/config/weatherLayerConfigs.ts`
- `src/features/weather-map/data/metarMockResponse.ts`
- `src/features/weather-map/hooks/useMetarWeatherLayers.ts`
- `src/features/weather-map/mappers/metarToWeatherPoints.ts`
- `src/features/weather-map/services/aviationWeatherMetarApi.ts`

