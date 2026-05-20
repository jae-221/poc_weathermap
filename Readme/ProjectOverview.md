# Weather Map POC - React + TypeScript

# Project Overview

This project is a React + TypeScript Proof of Concept (POC) for displaying METAR-based weather observations on Google Maps.

The current product direction is **station-based operational weather visualization**. METAR data is station observation data, so the target UI should display one marker per station at the real METAR latitude/longitude. The app should avoid implying weather coverage in areas where no station observation exists.

Legacy note: earlier phases used Google Maps `HeatmapLayer`. That code may still exist during migration, but heatmap rendering is no longer the target operational visualization for METAR data.

The application must:
- Render Google Maps on a web page.
- Use `@vis.gl/react-google-maps`.
- Fetch METAR GeoJSON data from AviationWeather through the development proxy.
- Display station-based weather markers for Rain, Wind, Thunderstorm, and Temperature.
- Preserve cloud data for future display and station detail panels.
- Use a scalable feature-based architecture.
- Be easy to extend in the future.

Reference:
- https://aviationweather.gov/data/api/
- https://aviationweather.gov/help/data/#metar
- https://visgl.github.io/react-google-maps/
- https://dev.to/pramod_boda/recommended-folder-structure-for-react-2025-48mc

---

# Tech Stack

- React
- TypeScript
- Vite
- @vis.gl/react-google-maps
- Google Maps JavaScript API
- AviationWeather METAR GeoJSON API

---

# Installation

## Create Project

```bash
npm create vite@latest weather-map-poc -- --template react-ts
cd weather-map-poc
npm install
