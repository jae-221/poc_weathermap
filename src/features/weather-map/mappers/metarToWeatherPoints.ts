import { createWeatherPointClusters } from '../utils/createWeatherPointClusters'
import type {
  MetarObservation,
  WeatherLayerType,
  WeatherPoint,
} from '../types/weatherMap.types'

const flightCategoryScores: Record<NonNullable<MetarObservation['fltCat']>, number> = {
  IFR: 0.72,
  LIFR: 0.9,
  MVFR: 0.48,
  VFR: 0.18,
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function parseVisibility(visib: MetarObservation['visib']) {
  if (typeof visib === 'number') {
    return visib
  }

  if (visib === '10+') {
    return 10
  }

  return Number(visib) || 10
}

function hasWeatherCode(observation: MetarObservation, codes: string[]) {
  const wxString = observation.wxString ?? ''
  const rawObservation = observation.rawOb ?? ''
  const raw = `${wxString} ${rawObservation}`.toUpperCase()

  return codes.some((code) => raw.includes(code))
}

function getRainSignal(observation: MetarObservation) {
  const precipScore = Math.min(
    Math.max(observation.precip ?? 0, observation.pcp3hr ?? 0) / 0.08,
    1,
  )
  const rainCodeScore = hasWeatherCode(observation, ['RA', 'SHRA', 'DZ'])
    ? 0.72
    : 0
  const showerNearbyScore = hasWeatherCode(observation, ['VCSH', 'SH'])
    ? 0.48
    : 0
  const thunderScore = hasWeatherCode(observation, ['TS', 'VCTS']) ? 0.2 : 0

  return clamp(
    Math.max(precipScore, rainCodeScore, showerNearbyScore) + thunderScore,
  )
}

function getTemperatureSignal(observation: MetarObservation) {
  return clamp(((observation.temp ?? 24) + 5) / 40, 0.08)
}

function getWindSignal(observation: MetarObservation) {
  const sustained = observation.wspd ?? 0
  const gust = observation.wgst ?? sustained

  return clamp((sustained * 0.68 + gust * 0.32) / 28, 0.06)
}

function getThunderstormSignal(observation: MetarObservation) {
  const thunderCodeScore = hasWeatherCode(observation, ['TSRA', 'VCTS', 'TS'])
    ? 0.82
    : 0
  const gustScore = clamp((observation.wgst ?? 0) / 35)
  const visibilityScore = clamp((6 - parseVisibility(observation.visib)) / 6)
  const fltCatScore = observation.fltCat
    ? flightCategoryScores[observation.fltCat]
    : 0

  return clamp(
    thunderCodeScore * 0.58 +
      gustScore * 0.18 +
      visibilityScore * 0.14 +
      fltCatScore * 0.1,
  )
}

function getSignal(observation: MetarObservation, layer: WeatherLayerType) {
  if (layer === 'rain') {
    return getRainSignal(observation)
  }

  if (layer === 'temperature') {
    return getTemperatureSignal(observation)
  }

  if (layer === 'wind') {
    return getWindSignal(observation)
  }

  if (layer === 'thunderstorm') {
    return getThunderstormSignal(observation)
  }

  return getTemperatureSignal(observation)
}

function hasLayerValue(observation: MetarObservation, layer: WeatherLayerType) {
  if (layer === 'temperature') {
    return typeof observation.temp === 'number'
  }

  if (layer === 'wind') {
    return (
      typeof observation.wspd === 'number' ||
      typeof observation.wgst === 'number'
    )
  }

  if (layer === 'rain') {
    return getRainSignal(observation) > 0
  }

  if (layer === 'thunderstorm') {
    return getThunderstormSignal(observation) > 0
  }

  return true
}

function getClusterSize(layer: WeatherLayerType) {
  if (layer === 'temperature') {
    return { radiusLat: 0.72, radiusLng: 0.72 }
  }

  if (layer === 'wind') {
    return { radiusLat: 0.62, radiusLng: 0.74 }
  }

  if (layer === 'rain') {
    return { radiusLat: 0.44, radiusLng: 0.5 }
  }

  if (layer === 'thunderstorm') {
    return { radiusLat: 0.32, radiusLng: 0.36 }
  }

  return { radiusLat: 0.38, radiusLng: 0.42 }
}

export function mapMetarToWeatherPoints(
  observations: MetarObservation[],
  layer: WeatherLayerType,
  pointsPerStation: number,
): WeatherPoint[] {
  const clusterSize = getClusterSize(layer)
  const clusters = observations
    .filter((observation) => hasLayerValue(observation, layer))
    .map((observation) => ({
      center: {
        lat: observation.lat,
        lng: observation.lon,
      },
      intensity: getSignal(observation, layer),
      ...clusterSize,
    }))

  return createWeatherPointClusters(clusters, pointsPerStation)
}
