import { useEffect, useMemo, useState } from 'react'
import { metarToWeatherStations } from '../mappers/metarToWeatherStations'
import {
  fetchMetarObservations,
  type MetarFetchSource,
} from '../services/aviationWeatherMetarApi'
import type { MetarObservation } from '../types/weatherMap.types'

type WeatherDataStatus = 'loading' | 'ready' | 'error'

type WeatherDataState = {
  error?: string
  observations: MetarObservation[]
  source?: MetarFetchSource
  status: WeatherDataStatus
}

export function useMetarWeatherLayers() {
  const [state, setState] = useState<WeatherDataState>({
    observations: [],
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
          observations: [],
          status: 'error',
        })
      })

    return () => abortController.abort()
  }, [])

  const stations = useMemo(
    () => metarToWeatherStations(state.observations),
    [state.observations],
  )

  return {
    ...state,
    stations,
  }
}
