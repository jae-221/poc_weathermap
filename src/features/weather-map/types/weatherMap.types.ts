export type WeatherLayerType =
  | 'temperature'
  | 'wind'
  | 'rain'

export type WeatherStationLayerType = WeatherLayerType

export type WeatherSeverity =
  | 'normal'
  | 'caution'
  | 'warning'
  | 'critical'

export type RainCondition = {
  type:
    | 'none'
    | 'drizzle'
    | 'nearby_shower'
    | 'recent_rain'
    | 'light_rain'
    | 'rain'
    | 'heavy_rain'
    | 'thunderstorm_rain'
  severity: WeatherSeverity
  label: string
  icon: string
}

export type WindCondition = {
  direction: number | 'VRB' | null
  speedKt: number | null
  gustKt: number | null
  severity: WeatherSeverity
  label: string
}

export type ThunderstormCondition = {
  detected: boolean
  source: 'wx' | 'rawOb' | 'clouds' | 'none'
  severity: WeatherSeverity
  label: string
}

export type TemperatureCondition = {
  tempC: number | null
  dewpointC: number | null
  severity: WeatherSeverity
  label: string
}

export type CloudCondition = {
  cover: string | null
  ceilingFt: number | null
  layers: {
    base: number | null
    cover: string
  }[]
  hasCb: boolean
  hasTcu: boolean
}

export type WeatherStation = {
  cloud: CloudCondition
  flightCategory: string | null
  id: string
  lat: number
  lng: number
  name: string
  observationTime: string | null
  overallSeverity: WeatherSeverity
  rain: RainCondition
  rawOb: string | null
  temperature: TemperatureCondition
  thunderstorm: ThunderstormCondition
  visibility: string | number | null
  wind: WindCondition
}

export type WeatherLayerConfig = {
  description: string
  id: WeatherLayerType
  label: string
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
  ceil?: number
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
  obsTime?: number | string
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

export type GeoJsonPoint = {
  coordinates: [number, number, ...number[]]
  type: 'Point'
}

export type GeoJsonFeature<
  TGeometry = GeoJsonPoint,
  TProperties = Record<string, unknown>,
> = {
  geometry: TGeometry | null
  properties: TProperties | null
  type: 'Feature'
}

export type GeoJsonFeatureCollection<
  TGeometry = GeoJsonPoint,
  TProperties = Record<string, unknown>,
> = {
  features: GeoJsonFeature<TGeometry, TProperties>[]
  type: 'FeatureCollection'
}

export type MetarGeoJsonProperties = Omit<MetarObservation, 'lat' | 'lon'> & {
  fltcat?: MetarObservation['fltCat']
  id?: string
  lat?: never
  lon?: never
  site?: string
  wx?: string | null
}

export type MetarGeoJsonFeature = GeoJsonFeature<
  GeoJsonPoint,
  Partial<MetarGeoJsonProperties>
>

export type MetarGeoJsonFeatureCollection = GeoJsonFeatureCollection<
  GeoJsonPoint,
  Partial<MetarGeoJsonProperties>
>
