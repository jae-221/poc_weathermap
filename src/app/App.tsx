import { WeatherMap } from '../features/weather-map'
import './App.css'

function App() {
  return (
    <main className="app-shell">
      <section className="app-header">
        <h1>Weather Map POC</h1>
        <p>
          A station-based METAR weather map centered on Bangkok.
        </p>
      </section>

      <section className="map-panel" aria-label="Bangkok weather map">
        <WeatherMap />
      </section>
    </main>
  )
}

export default App
