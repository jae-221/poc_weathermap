import type {
  MetarCloudLayer,
  MetarObservation,
  WeatherStation,
} from '../types/weatherMap.types'
import {
  parseCloudCondition,
  parseRainCondition,
  parseTemperatureCondition,
  parseThunderstormCondition,
  parseWindCondition,
} from './metarWeatherConditionParsers'
import { getHighestSeverity } from '../utils/weatherSeverity'

function toNullableString(value: string | undefined) {
  return value ?? null
}

function toNullableNumber(value: number | undefined | null) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function isValidCoordinate(lat: number, lng: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  )
}

function normalizeCloudLayers(clouds: MetarCloudLayer[] | undefined) {
  return (clouds ?? []).map((cloud) => ({
    base: toNullableNumber(cloud.base),
    cover: cloud.cover,
  }))
}

function normalizeObservationTime(observation: MetarObservation) {
  if (typeof observation.obsTime === 'string') {
    return observation.obsTime
  }

  if (typeof observation.reportTime === 'string') {
    return observation.reportTime
  }

  if (typeof observation.receiptTime === 'string') {
    return observation.receiptTime
  }

  if (typeof observation.obsTime === 'number') {
    return new Date(observation.obsTime).toISOString()
  }

  return null
}

export function metarToWeatherStations(
  observations: MetarObservation[],
): WeatherStation[] {
  return observations
    .filter((observation) => isValidCoordinate(observation.lat, observation.lon))
    .map((observation) => {
      const clouds = normalizeCloudLayers(observation.clouds)
      const wx = toNullableString(observation.wxString)
      const rawOb = toNullableString(observation.rawOb)
      const rain = parseRainCondition({ rawOb, wx })
      const wind = parseWindCondition({
        wdir: observation.wdir ?? null,
        wgst: toNullableNumber(observation.wgst),
        wspd: toNullableNumber(observation.wspd),
      })
      const thunderstorm = parseThunderstormCondition({
        clouds,
        rawOb,
        wx,
      })
      const temperature = parseTemperatureCondition({
        dewp: toNullableNumber(observation.dewp),
        temp: toNullableNumber(observation.temp),
      })
      const cloud = parseCloudCondition({
        ceil: toNullableNumber(observation.ceil),
        clouds,
        cover: toNullableString(observation.cover),
        rawOb,
      })
      const overallSeverity = getHighestSeverity([
        rain.severity,
        wind.severity,
        thunderstorm.severity,
        temperature.severity,
      ])

      return {
        cloud,
        flightCategory: observation.fltCat ?? null,
        id: observation.icaoId,
        lat: observation.lat,
        lng: observation.lon,
        name: observation.name,
        observationTime: normalizeObservationTime(observation),
        overallSeverity,
        rain,
        rawOb,
        temperature,
        thunderstorm,
        visibility: observation.visib ?? null,
        wind,
      }
    })
}
