import { useEffect, useState } from 'react'
import {
  APIProvider,
  APILoadingStatus,
  Map,
  useApiLoadingStatus,
} from '@vis.gl/react-google-maps'
import { env } from '../../../config/env'
import { useMetarWeatherLayers } from '../hooks/useMetarWeatherLayers'
import type { WeatherLayerType } from '../types/weatherMap.types'
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

export function WeatherMap() {
  const hasApiKey = env.googleMapsApiKey.trim().length > 0
  const [apiError, setApiError] = useState(false)
  const weatherData = useMetarWeatherLayers()
  const [selectedLayerId, setSelectedLayerId] =
    useState<WeatherLayerType>('temperature')
  const selectedLayer =
    weatherData.layers.find((layer) => layer.id === selectedLayerId) ??
    weatherData.layers[0]

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
          <WeatherHeatmapLayer
            config={selectedLayer}
            points={selectedLayer.points}
          />
        </Map>
        <div className="weather-layer-actions" aria-label="Weather layer types">
          {weatherData.layers.map((layer) => {
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
        <WeatherDataMessage
          error={weatherData.error}
          source={weatherData.source}
          status={weatherData.status}
          totalObservations={weatherData.observations.length}
        />
        <MapLoadingMessage hasApiError={apiError} />
      </div>
    </APIProvider>
  )
}

type WeatherDataMessageProps = {
  error?: string
  source?: string
  status: string
  totalObservations: number
}

function getWeatherDataLabel({
  source,
  status,
}: Pick<WeatherDataMessageProps, 'source' | 'status'>) {
  if (status === 'loading') {
    return 'Loading METAR data'
  }

  if (source === 'api') {
    return 'Live METAR API'
  }

  if (source === 'cache') {
    return 'Cached METAR data'
  }

  if (source === 'stale-cache') {
    return 'Stale METAR cache'
  }

  if (status === 'error') {
    return 'METAR API unavailable'
  }

  return 'Waiting for METAR data'
}

function WeatherDataMessage({
  error,
  source,
  status,
  totalObservations,
}: WeatherDataMessageProps) {
  return (
    <div className="weather-data-status" role="status">
      <span>{getWeatherDataLabel({ source, status })}</span>
      <span>{totalObservations} stations</span>
      {error ? <span title={error}>API unavailable</span> : null}
    </div>
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
    const timeoutId = window.setTimeout(() => {
      if (status === APILoadingStatus.LOADED && hasGoogleMapsApi()) {
        setIsTakingTooLong(false)
        setIsGoogleMapsUnavailable(false)
        return
      }

      setIsTakingTooLong(true)
      setIsGoogleMapsUnavailable(!hasGoogleMapsApi())
    }, status === APILoadingStatus.LOADED ? 0 : 3000)

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
