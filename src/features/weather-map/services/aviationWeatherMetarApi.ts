import type { MetarObservation } from '../types/weatherMap.types'

const AVIATION_WEATHER_BASE_URL = '/api/aviationweather/metar'
const AVIATION_WEATHER_BBOX = '5.5,97.0,20.5,106.0'

export const METAR_CACHE_TTL_MS = 60 * 60 * 1000
export const METAR_CACHE_KEY =
  `poc-weathermap:aviationweather:metar:bbox:${AVIATION_WEATHER_BBOX}`

type CachedMetarPayload = {
  cachedAt: number
  observations: MetarObservation[]
}

export type MetarFetchSource = 'api' | 'cache' | 'stale-cache'

export type MetarFetchResult = {
  observations: MetarObservation[]
  source: MetarFetchSource
}

export function getAviationWeatherMetarUrl() {
  const params = new URLSearchParams({
    bbox: AVIATION_WEATHER_BBOX,
    format: 'json',
  })

  return `${AVIATION_WEATHER_BASE_URL}?${params.toString()}`
}

export function isValidMetarObservation(
  observation: Partial<MetarObservation>,
): observation is MetarObservation {
  return (
    typeof observation.icaoId === 'string' &&
    typeof observation.name === 'string' &&
    typeof observation.lat === 'number' &&
    Number.isFinite(observation.lat) &&
    typeof observation.lon === 'number' &&
    Number.isFinite(observation.lon)
  )
}

function readCachedMetar(now = Date.now(), allowStale = false) {
  const cached = window.localStorage.getItem(METAR_CACHE_KEY)

  if (!cached) {
    return null
  }

  try {
    const parsed = JSON.parse(cached) as Partial<CachedMetarPayload>
    const observations = Array.isArray(parsed.observations)
      ? parsed.observations.filter(isValidMetarObservation)
      : []
    const cachedAt =
      typeof parsed.cachedAt === 'number' ? parsed.cachedAt : undefined

    if (!cachedAt || observations.length === 0) {
      return null
    }

    const isFresh = now - cachedAt <= METAR_CACHE_TTL_MS

    if (!isFresh && !allowStale) {
      return null
    }

    return {
      observations,
      source: isFresh ? 'cache' : 'stale-cache',
    } satisfies MetarFetchResult
  } catch {
    return null
  }
}

function writeMetarCache(observations: MetarObservation[]) {
  const payload: CachedMetarPayload = {
    cachedAt: Date.now(),
    observations,
  }

  window.localStorage.setItem(METAR_CACHE_KEY, JSON.stringify(payload))
}

export async function fetchMetarObservations(
  signal?: AbortSignal,
): Promise<MetarFetchResult> {
  const cached = readCachedMetar()

  if (cached) {
    return cached
  }

  try {
    const response = await fetch(getAviationWeatherMetarUrl(), { signal })

    if (response.status === 204) {
      throw new Error('AviationWeather API returned no METAR records for bbox')
    }

    if (!response.ok) {
      throw new Error(`AviationWeather API returned ${response.status}`)
    }

    const body = (await response.json()) as Partial<MetarObservation>[]
    const observations = Array.isArray(body)
      ? body.filter(isValidMetarObservation)
      : []

    if (observations.length === 0) {
      throw new Error('AviationWeather API returned no valid METAR records')
    }

    writeMetarCache(observations)

    return {
      observations,
      source: 'api',
    }
  } catch (error) {
    if (signal?.aborted) {
      throw error
    }

    const staleCache = readCachedMetar(Date.now(), true)

    if (staleCache) {
      return staleCache
    }

    throw error
  }
}
