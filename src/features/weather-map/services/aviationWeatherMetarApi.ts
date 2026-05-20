import type {
  MetarGeoJsonFeature,
  MetarGeoJsonFeatureCollection,
  MetarObservation,
} from '../types/weatherMap.types'

const AVIATION_WEATHER_BASE_URL = '/api/aviationweather/metar'
const AVIATION_WEATHER_BBOX = '5.5,97.0,20.5,106.0'

export const METAR_CACHE_TTL_MS = 60 * 60 * 1000
export const METAR_CACHE_KEY =
  `poc-weathermap:aviationweather:metar:geojson:bbox:${AVIATION_WEATHER_BBOX}`

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
    format: 'geojson',
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isMetarGeoJsonFeatureCollection(
  value: unknown,
): value is MetarGeoJsonFeatureCollection {
  return (
    isRecord(value) &&
    value.type === 'FeatureCollection' &&
    Array.isArray(value.features)
  )
}

function isMetarGeoJsonFeature(
  feature: unknown,
): feature is MetarGeoJsonFeature {
  if (!isRecord(feature) || feature.type !== 'Feature') {
    return false
  }

  const geometry = feature.geometry

  return (
    isRecord(geometry) &&
    geometry.type === 'Point' &&
    Array.isArray(geometry.coordinates) &&
    typeof geometry.coordinates[0] === 'number' &&
    Number.isFinite(geometry.coordinates[0]) &&
    typeof geometry.coordinates[1] === 'number' &&
    Number.isFinite(geometry.coordinates[1]) &&
    (feature.properties === null || isRecord(feature.properties))
  )
}

function mapMetarGeoJsonFeature(
  feature: MetarGeoJsonFeature,
): MetarObservation | null {
  if (!feature.geometry) {
    return null
  }

  const [lon, lat] = feature.geometry.coordinates
  const properties = feature.properties ?? {}
  const icaoId = properties.icaoId ?? properties.id

  if (typeof icaoId !== 'string') {
    return null
  }

  const observation: MetarObservation = {
    ...properties,
    fltCat: properties.fltCat ?? properties.fltcat,
    icaoId,
    lat,
    lon,
    name:
      typeof properties.name === 'string'
        ? properties.name
        : typeof properties.site === 'string'
          ? properties.site
          : icaoId,
    wxString:
      typeof properties.wxString === 'string'
        ? properties.wxString
        : typeof properties.wx === 'string'
          ? properties.wx
          : undefined,
  }

  return isValidMetarObservation(observation) ? observation : null
}

function parseMetarObservations(body: unknown) {
  if (isMetarGeoJsonFeatureCollection(body)) {
    return body.features
      .filter(isMetarGeoJsonFeature)
      .map(mapMetarGeoJsonFeature)
      .filter((observation): observation is MetarObservation =>
        Boolean(observation),
      )
  }

  if (Array.isArray(body)) {
    return body.filter(isValidMetarObservation)
  }

  return []
}

function readCachedMetar(now = Date.now(), allowStale = false) {
  const cached = readCacheValue()

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

function readCacheValue() {
  try {
    return window.localStorage.getItem(METAR_CACHE_KEY)
  } catch {
    return null
  }
}

function writeMetarCache(observations: MetarObservation[]) {
  const payload: CachedMetarPayload = {
    cachedAt: Date.now(),
    observations,
  }

  try {
    window.localStorage.setItem(METAR_CACHE_KEY, JSON.stringify(payload))
  } catch {
    // Cache failure should not block live METAR rendering.
  }
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

    const body = (await response.json()) as unknown
    const observations = parseMetarObservations(body)

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
