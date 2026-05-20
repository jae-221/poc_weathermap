export type WeatherLayerType =
  | 'temperature'
  | 'wind'
  | 'rain'
  | 'thunderstorm'
  | 'visibility'
  | 'fog'
  | 'cloudCoverage'

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
  thunderstormSeverity?: number
  visibilityKm?: number
  weight?: number
  radius?: number
}

export type WeatherLayerRadiusConfig = {
  base: number
  geographic: number
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
