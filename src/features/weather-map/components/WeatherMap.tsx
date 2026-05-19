import { useEffect, useState } from 'react'
import {
  APIProvider,
  APILoadingStatus,
  Map,
  useApiLoadingStatus,
} from '@vis.gl/react-google-maps'
import { env } from '../../../config/env'
import './WeatherMap.css'

const defaultCenter = {
  lat: 13.7563,
  lng: 100.5018,
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
          defaultZoom={11}
          gestureHandling="greedy"
          disableDefaultUI={false}
        />
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
