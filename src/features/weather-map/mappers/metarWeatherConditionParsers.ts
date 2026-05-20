import type {
  CloudCondition,
  RainCondition,
  TemperatureCondition,
  ThunderstormCondition,
  WindCondition,
} from '../types/weatherMap.types'
import {
  hasCbSignal,
  getWeatherTokens,
  hasNearbySignal,
  hasRainSignal,
  hasRecentRainSignal,
  hasTcuSignal,
  hasThunderstormSignal,
  normalizeWeatherText,
} from '../utils/metarWeatherCodes'
import {
  getRainSeverity,
  getTemperatureSeverity,
  getThunderstormSeverity,
  getWindSeverity,
} from '../utils/weatherSeverity'

type CloudLayerInput = {
  base: number | null
  cover: string
}

function hasWeatherCode(
  wx: string | null,
  rawOb: string | null,
  code: string,
) {
  return getWeatherTokens(wx, rawOb).some(
    (token) => token === code || token.replace(/^[+-]/, '') === code,
  )
}

export function parseRainCondition(params: {
  rawOb: string | null
  wx: string | null
}): RainCondition {
  const { rawOb, wx } = params
  const weatherTokens = getWeatherTokens(wx, rawOb)
  const severity = getRainSeverity(wx, rawOb)
  const hasToken = (...codes: string[]) =>
    weatherTokens.some((token) => codes.includes(token))

  if (hasWeatherCode(wx, rawOb, 'TSRA')) {
    return {
      icon: 'thunderstorm',
      label: hasToken('+TSRA')
        ? 'Heavy thunderstorm rain'
        : 'Thunderstorm rain',
      severity,
      type: 'thunderstorm_rain',
    }
  }

  if (hasToken('+DZ')) {
    return {
      icon: 'heavy-rain',
      label: 'Heavy drizzle',
      severity,
      type: 'drizzle',
    }
  }

  if (hasToken('-DZ')) {
    return {
      icon: 'light-rain',
      label: 'Light drizzle',
      severity,
      type: 'drizzle',
    }
  }

  if (hasToken('DZ')) {
    return {
      icon: 'light-rain',
      label: 'Drizzle',
      severity,
      type: 'drizzle',
    }
  }

  if (hasToken('+RA', '+SHRA')) {
    return {
      icon: 'heavy-rain',
      label: 'Heavy rain',
      severity,
      type: 'heavy_rain',
    }
  }

  if (hasToken('-RA', '-SHRA')) {
    return {
      icon: 'light-rain',
      label: 'Light rain',
      severity,
      type: 'light_rain',
    }
  }

  if (hasWeatherCode(wx, rawOb, 'RA') || hasWeatherCode(wx, rawOb, 'SHRA')) {
    return {
      icon: 'rain',
      label: 'Rain',
      severity,
      type: 'rain',
    }
  }

  if (hasNearbySignal(wx, rawOb)) {
    return {
      icon: 'nearby-shower',
      label: 'Nearby shower',
      severity,
      type: 'nearby_shower',
    }
  }

  if (hasRecentRainSignal(wx, rawOb)) {
    return {
      icon: 'recent-rain',
      label: 'Recent rain',
      severity,
      type: 'recent_rain',
    }
  }

  if (hasRainSignal(wx, rawOb)) {
    return {
      icon: 'rain',
      label: 'Rain signal',
      severity,
      type: 'rain',
    }
  }

  return {
    icon: 'cloud',
    label: 'No rain',
    severity,
    type: 'none',
  }
}

export function parseWindCondition(params: {
  wdir: number | 'VRB' | null
  wgst: number | null
  wspd: number | null
}): WindCondition {
  const { wdir, wgst, wspd } = params
  const severity = getWindSeverity(wspd, wgst)
  const speedLabel = typeof wspd === 'number' ? `${wspd} kt` : 'Wind N/A'
  const gustLabel = typeof wgst === 'number' ? ` G${wgst}` : ''
  const directionLabel = wdir === 'VRB' ? 'VRB' : typeof wdir === 'number' ? `${wdir}°` : ''

  return {
    direction: wdir,
    gustKt: wgst,
    label: [directionLabel, `${speedLabel}${gustLabel}`]
      .filter(Boolean)
      .join(' '),
    severity,
    speedKt: wspd,
  }
}

export function parseThunderstormCondition(params: {
  clouds: CloudLayerInput[]
  rawOb: string | null
  wx: string | null
}): ThunderstormCondition {
  const { clouds, rawOb, wx } = params
  const cloudHasCb = clouds.some((cloud) =>
    normalizeWeatherText(cloud.cover).includes('CB'),
  )
  const cloudHasTcu = clouds.some((cloud) =>
    normalizeWeatherText(cloud.cover).includes('TCU'),
  )
  const hasCb = cloudHasCb || hasCbSignal(rawOb)
  const hasTcu = cloudHasTcu || hasTcuSignal(rawOb)
  const hasWeatherTs = hasThunderstormSignal(wx, rawOb)
  const severity = getThunderstormSeverity({
    hasCb,
    hasTcu,
    rawOb,
    wx,
  })

  if (hasWeatherTs) {
    return {
      detected: true,
      label: 'Thunderstorm detected',
      severity,
      source: normalizeWeatherText(wx) ? 'wx' : 'rawOb',
    }
  }

  if (hasCb) {
    return {
      detected: true,
      label: 'Cumulonimbus signal',
      severity,
      source: cloudHasCb ? 'clouds' : 'rawOb',
    }
  }

  if (hasTcu) {
    return {
      detected: true,
      label: 'Towering cumulus signal',
      severity,
      source: cloudHasTcu ? 'clouds' : 'rawOb',
    }
  }

  return {
    detected: false,
    label: 'No convective signal',
    severity,
    source: 'none',
  }
}

export function parseTemperatureCondition(params: {
  dewp: number | null
  temp: number | null
}): TemperatureCondition {
  const { dewp, temp } = params

  return {
    dewpointC: dewp,
    label: typeof temp === 'number' ? `${temp}°C` : 'Temperature N/A',
    severity: getTemperatureSeverity(temp),
    tempC: temp,
  }
}

export function parseCloudCondition(params: {
  ceil: number | null
  clouds: CloudLayerInput[]
  cover: string | null
  rawOb: string | null
}): CloudCondition {
  const { ceil, clouds, cover, rawOb } = params

  return {
    ceilingFt: ceil,
    cover,
    hasCb:
      clouds.some((cloud) => normalizeWeatherText(cloud.cover).includes('CB')) ||
      hasCbSignal(rawOb),
    hasTcu:
      clouds.some((cloud) =>
        normalizeWeatherText(cloud.cover).includes('TCU'),
      ) || hasTcuSignal(rawOb),
    layers: clouds,
  }
}
