import type { WeatherSeverity } from '../types/weatherMap.types'
import {
  hasCbSignal,
  getWeatherTokens,
  hasNearbySignal,
  hasRainSignal,
  hasRecentRainSignal,
  hasTcuSignal,
  hasThunderstormSignal,
  normalizeWeatherText,
} from './metarWeatherCodes'

const severityRank: Record<WeatherSeverity, number> = {
  caution: 1,
  critical: 3,
  normal: 0,
  warning: 2,
}

export function getHighestSeverity(
  severities: WeatherSeverity[],
): WeatherSeverity {
  return severities.reduce<WeatherSeverity>(
    (highest, severity) =>
      severityRank[severity] > severityRank[highest] ? severity : highest,
    'normal',
  )
}

export function getWindSeverity(
  speedKt: number | null,
  gustKt: number | null,
): WeatherSeverity {
  const strongestWind = Math.max(speedKt ?? 0, gustKt ?? 0)

  if (strongestWind >= 30) {
    return 'critical'
  }

  if (strongestWind >= 20) {
    return 'warning'
  }

  if (strongestWind >= 10) {
    return 'caution'
  }

  return 'normal'
}

export function getTemperatureSeverity(
  tempC: number | null,
): WeatherSeverity {
  if (tempC === null) {
    return 'normal'
  }

  if (tempC >= 39) {
    return 'critical'
  }

  if (tempC >= 35) {
    return 'warning'
  }

  if (tempC >= 30) {
    return 'caution'
  }

  return 'normal'
}

export function getRainSeverity(
  wx: string | null,
  rawOb: string | null,
): WeatherSeverity {
  const weatherTokens = getWeatherTokens(wx, rawOb)

  if (
    weatherTokens.some((token) =>
      ['+RA', '+SHRA', '+DZ', '+TSRA'].includes(token),
    )
  ) {
    return 'critical'
  }

  if (
    weatherTokens.some((token) =>
      ['RA', 'SHRA', 'DZ', 'TSRA'].includes(token),
    )
  ) {
    return 'warning'
  }

  if (
    weatherTokens.some((token) =>
      ['-RA', '-SHRA', '-DZ', '-TSRA'].includes(token),
    )
  ) {
    return 'caution'
  }

  if (hasNearbySignal(wx, rawOb) || hasRecentRainSignal(wx, rawOb)) {
    return 'caution'
  }

  if (hasRainSignal(wx, rawOb)) {
    return 'warning'
  }

  return 'normal'
}

export function getThunderstormSeverity(params: {
  hasCb: boolean
  hasTcu: boolean
  rawOb: string | null
  wx: string | null
}): WeatherSeverity {
  const { hasCb, hasTcu, rawOb, wx } = params
  const normalizedWeather = normalizeWeatherText(wx)

  if (
    normalizedWeather.includes('+TSRA') ||
    normalizedWeather.includes('TSRA')
  ) {
    return 'critical'
  }

  if (normalizedWeather.includes('VCTS') || hasCb || hasCbSignal(rawOb)) {
    return 'warning'
  }

  if (hasTcu || hasTcuSignal(rawOb)) {
    return 'caution'
  }

  if (hasThunderstormSignal(wx, rawOb)) {
    return 'warning'
  }

  return 'normal'
}
