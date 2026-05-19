import { useEffect, useState } from 'react'
import {
  APIProvider,
  APILoadingStatus,
  Map,
  useApiLoadingStatus,
} from '@vis.gl/react-google-maps'
import { env } from '../../../config/env'
import { radarMockPoints } from '../data/radarMockPoints'
import { rainMockPoints } from '../data/rainMockPoints'
import { temperatureMockPoints } from '../data/temperatureMockPoints'
import { windMockPoints } from '../data/windMockPoints'
import { WeatherHeatmapLayer } from './WeatherHeatmapLayer'
import './WeatherMap.css'

const defaultCenter = {
  lat: 13.3,
  lng: 101,
}

type GoogleMapsGlobal = typeof globalThis & {
  google?: {
    maps?: unknown
  }
}

function hasGoogleMapsApi() {
  return Boolean((globalThis as GoogleMapsGlobal).google?.maps)
}

const weatherLayers = [
  {
    id: 'radar',
    label: 'Weather Radar',
    points: radarMockPoints,
    thumbClassName: 'weather-layer-thumb-radar',
  },
  {
    id: 'wind',
    label: 'Wind',
    points: windMockPoints,
    thumbClassName: 'weather-layer-thumb-wind',
  },
  {
    id: 'rain',
    label: 'Rain',
    points: rainMockPoints,
    thumbClassName: 'weather-layer-thumb-rain',
  },
  {
    id: 'temperature',
    label: 'Temperature',
    points: temperatureMockPoints,
    thumbClassName: 'weather-layer-thumb-temperature',
  },
] as const

type WeatherLayerId = (typeof weatherLayers)[number]['id']

export function WeatherMap() {
  const hasApiKey = env.googleMapsApiKey.trim().length > 0
  const [apiError, setApiError] = useState(false)
  const [selectedLayerId, setSelectedLayerId] =
    useState<WeatherLayerId>('radar')
  const selectedLayer =
    weatherLayers.find((layer) => layer.id === selectedLayerId) ??
    weatherLayers[0]

  if (!hasApiKey) {
    return (
      <div className="weather-map weather-map-message">
        Google Maps API key is missing. Add VITE_GOOGLE_MAPS_API_KEY to .env.
      </div>
    )
  }

  return (
    <APIProvider apiKey={env.googleMapsApiKey} onError={() => setApiError(true)}>
      <div className="weather-map-frame">
        <Map
          className="weather-map"
          defaultCenter={defaultCenter}
          defaultZoom={5}
          minZoom={4}
          maxZoom={15}
          gestureHandling="greedy"
          mapTypeControl={false}
          streetViewControl={false}
          disableDefaultUI={false}
        >
          <WeatherHeatmapLayer points={selectedLayer.points} />
        </Map>
        <div className="weather-layer-actions" aria-label="Weather layer types">
          {weatherLayers.map((layer) => {
            const isSelected = layer.id === selectedLayerId

            return (
              <button
                aria-pressed={isSelected}
                className="weather-layer-button"
                key={layer.id}
                onClick={() => setSelectedLayerId(layer.id)}
                type="button"
              >
                <span>{layer.label}</span>
                <span
                  className={`weather-layer-thumb ${layer.thumbClassName}`}
                />
              </button>
            )
          })}
        </div>
        <MapLoadingMessage hasApiError={apiError} />
      </div>
    </APIProvider>
  )
}

type MapLoadingMessageProps = {
  hasApiError: boolean
}

function MapLoadingMessage({ hasApiError }: MapLoadingMessageProps) {
  const status = useApiLoadingStatus()
  const [isTakingTooLong, setIsTakingTooLong] = useState(false)
  const [isGoogleMapsUnavailable, setIsGoogleMapsUnavailable] = useState(false)

  useEffect(() => {
    if (status === APILoadingStatus.LOADED && hasGoogleMapsApi()) {
      setIsTakingTooLong(false)
      setIsGoogleMapsUnavailable(false)
      return
    }

    const timeoutId = window.setTimeout(() => {
      setIsTakingTooLong(true)
      setIsGoogleMapsUnavailable(!hasGoogleMapsApi())
    }, 3000)

    return () => window.clearTimeout(timeoutId)
  }, [status])

  if (
    status === APILoadingStatus.LOADED &&
    !hasApiError &&
    !isGoogleMapsUnavailable
  ) {
    return null
  }

  if (
    status === APILoadingStatus.LOADING ||
    status === APILoadingStatus.NOT_LOADED ||
    status === APILoadingStatus.LOADED
  ) {
    if (!isTakingTooLong) {
      return null
    }
  }

  return (
    <div className="weather-map-overlay" role="status">
      <strong>Google Maps could not be loaded.</strong>
      <span>
        Check that the API key is valid, Maps JavaScript API is enabled, billing
        is active, and localhost is allowed in key restrictions.
      </span>
    </div>
  )
}
