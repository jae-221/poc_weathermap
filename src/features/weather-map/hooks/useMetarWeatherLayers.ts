import { useEffect, useMemo, useState } from 'react'
import { weatherLayerConfigs } from '../config/weatherLayerConfigs'
import { metarMockResponse } from '../data/metarMockResponse'
import { mapMetarToWeatherPoints } from '../mappers/metarToWeatherPoints'
import {
  fetchMetarObservations,
  type MetarFetchSource,
} from '../services/aviationWeatherMetarApi'
import type {
  MetarObservation,
  WeatherLayerConfig,
  WeatherLayerType,
} from '../types/weatherMap.types'

type WeatherDataStatus = 'loading' | 'ready' | 'fallback'

type WeatherDataState = {
  error?: string
  observations: MetarObservation[]
  source: MetarFetchSource | 'mock'
  status: WeatherDataStatus
}

const pointsPerStationByLayer: Record<WeatherLayerType, number> = {
  radar: 8,
  rain: 8,
  temperature: 6,
  thunderstorm: 8,
  wind: 6,
}

function createLayerConfigs(
  observations: MetarObservation[],
): WeatherLayerConfig[] {
  return weatherLayerConfigs.map((layer) => ({
    ...layer,
    points: mapMetarToWeatherPoints(
      observations,
      layer.id,
      pointsPerStationByLayer[layer.id],
    ),
  }))
}

export function useMetarWeatherLayers() {
  const [state, setState] = useState<WeatherDataState>({
    observations: metarMockResponse,
    source: 'mock',
    status: 'loading',
  })

  useEffect(() => {
    const abortController = new AbortController()

    fetchMetarObservations(abortController.signal)
      .then((result) => {
        setState({
          observations: result.observations,
          source: result.source,
          status: 'ready',
        })
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return
        }

        setState({
          error: error instanceof Error ? error.message : 'Unknown API error',
          observations: metarMockResponse,
          source: 'mock',
          status: 'fallback',
        })
      })

    return () => abortController.abort()
  }, [])

  const layers = useMemo(
    () => createLayerConfigs(state.observations),
    [state.observations],
  )

  return {
    ...state,
    layers,
  }
}
