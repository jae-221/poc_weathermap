# Weather Map POC - React + TypeScript

# Project Overview

This project is a React + TypeScript Proof of Concept (POC) for displaying weather-related data on Google Maps using Heatmap visualization.

The application must:
- Render Google Maps on a web page.
- Use `@vis.gl/react-google-maps`.
- Display weather data as a heatmap layer.
- Use a scalable feature-based architecture.
- Be easy to extend in the future.

Reference:
- https://visgl.github.io/react-google-maps/examples/heatmap
- https://dev.to/pramod_boda/recommended-folder-structure-for-react-2025-48mc

---

# Tech Stack

- React
- TypeScript
- Vite
- @vis.gl/react-google-maps
- Google Maps JavaScript API
- Google Maps Visualization Library

---

# Installation

## Create Project

```bash
npm create vite@latest weather-map-poc -- --template react-ts
cd weather-map-poc
npm install