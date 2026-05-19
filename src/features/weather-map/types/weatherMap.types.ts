export type WeatherLayerType =
  | 'radar'
  | 'temperature'
  | 'wind'
  | 'rain'
  | 'thunderstorm'

export type WeatherHeatmapPoint = {
  id: string
  lat: number
  lng: number
  value: number
  unit?: string
  temperatureC?: number
  windKt?: number
  gustKt?: number
  rainfallMmHr?: number
  radarDbz?: number
  thunderstormSeverity?: number
  visibilityKm?: number
  weight?: number
  radius?: number
}

export type WeatherLayerRadiusConfig = {
  base: number
  min: number
  max: number
  scale: number
}

export type WeatherLayerRenderingConfig = {
  id: WeatherLayerType
  label: string
  gradient: string[]
  maxIntensity: number
  opacity: number
  radius: WeatherLayerRadiusConfig
}

export type WeatherLayerConfig = WeatherLayerRenderingConfig & {
  points: WeatherPoint[]
  thumbClassName: string
}

export type WeatherPoint = Omit<
  WeatherHeatmapPoint,
  'id' | 'value' | 'weight'
> & {
  id?: string
  value?: number
  weight: number
}

export type MetarCloudCover =
  | 'CAVOK'
  | 'CLR'
  | 'FEW'
  | 'SCT'
  | 'BKN'
  | 'OVC'
  | 'OVX'

export type MetarFlightCategory = 'VFR' | 'MVFR' | 'IFR' | 'LIFR'

export type MetarReportType = 'METAR' | 'SPECI'

export type MetarCloudLayer = {
  base?: number
  cover: MetarCloudCover | string
}

export type MetarObservation = {
  altim?: number
  clouds?: MetarCloudLayer[]
  cover?: MetarCloudCover | string
  dewp?: number
  elev?: number
  fltCat?: MetarFlightCategory
  icaoId: string
  lat: number
  lon: number
  metarType?: MetarReportType
  name: string
  obsTime?: number
  pcp3hr?: number
  precip?: number
  presTend?: number
  qcField?: number
  rawOb?: string
  receiptTime?: string
  reportTime?: string
  slp?: number
  temp?: number
  visib?: number | string
  vertVis?: number
  wdir?: number | 'VRB'
  wgst?: number
  wspd?: number
  wxString?: string
}
