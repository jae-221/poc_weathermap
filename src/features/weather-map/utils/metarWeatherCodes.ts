const rainCodes = new Set([
  '-RA',
  'RA',
  '+RA',
  '-SHRA',
  'SHRA',
  '+SHRA',
  'DZ',
  '-DZ',
  '+DZ',
  'TSRA',
  '-TSRA',
  '+TSRA',
])

const thunderstormCodes = new Set(['TS', 'TSRA', '-TSRA', '+TSRA', 'VCTS'])
const nearbyCodes = new Set(['VC', 'VCSH', 'VCTS'])
const recentRainCodes = new Set(['RERA', 'RETSRA', 'RESHRA'])

export function normalizeWeatherText(value: string | null | undefined) {
  return value?.trim().toUpperCase() ?? ''
}

function tokenizeWeatherText(value: string | null | undefined) {
  return normalizeWeatherText(value)
    .split(/\s+/)
    .flatMap((token) => token.match(/[+-]?[A-Z]{2,}/g) ?? [])
}

function getPresentWeatherText(value: string | null | undefined) {
  return normalizeWeatherText(value).split(/\s(?:BECMG|RMK|TEMPO)\s/)[0] ?? ''
}

export function getWeatherTokens(wx: string | null, rawOb: string | null) {
  const wxTokens = tokenizeWeatherText(wx)

  if (wxTokens.length > 0) {
    return wxTokens
  }

  return tokenizeWeatherText(getPresentWeatherText(rawOb)).filter(
    (token) => token !== 'METAR' && token !== 'SPECI',
  )
}

function tokenMatchesCode(token: string, code: string) {
  return token === code || token.replace(/^[+-]/, '') === code
}

function hasAnyCode(
  wx: string | null,
  rawOb: string | null,
  codes: ReadonlySet<string>,
) {
  return getWeatherTokens(wx, rawOb).some((token) => {
    if (codes.has(token)) {
      return true
    }

    return Array.from(codes).some((code) => tokenMatchesCode(token, code))
  })
}

export function hasRainSignal(wx: string | null, rawOb: string | null) {
  return hasAnyCode(wx, rawOb, rainCodes) || hasRecentRainSignal(wx, rawOb)
}

export function hasThunderstormSignal(
  wx: string | null,
  rawOb: string | null,
) {
  return hasAnyCode(wx, rawOb, thunderstormCodes)
}

export function hasCbSignal(rawOb: string | null) {
  return getWeatherTokens(null, rawOb).some((token) => token === 'CB')
}

export function hasTcuSignal(rawOb: string | null) {
  return getWeatherTokens(null, rawOb).some((token) => token === 'TCU')
}

export function hasNearbySignal(wx: string | null, rawOb: string | null) {
  return hasAnyCode(wx, rawOb, nearbyCodes)
}

export function hasRecentRainSignal(wx: string | null, rawOb: string | null) {
  return hasAnyCode(wx, rawOb, recentRainCodes)
}
