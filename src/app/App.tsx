import { WeatherMap } from '../features/weather-map/components/WeatherMap'
import './App.css'

function App() {
  return (
    <main className="app-shell">
      <section className="app-header">
        <h1>Weather Map POC</h1>
        <p>
          A basic Google Map centered on Bangkok, ready for weather heatmap data.
        </p>
      </section>

      <section className="map-panel" aria-label="Bangkok weather map">
        <WeatherMap />
      </section>
    </main>
  )
}

export default App
