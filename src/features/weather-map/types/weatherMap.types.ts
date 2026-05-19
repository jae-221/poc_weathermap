export type WeatherPoint = {
  lat: number
  lng: number
  weight: number
}

export type MetarCloudLayer = {
  base?: number
  cover: string
}

export type MetarObservation = {
  altim?: number
  clouds?: MetarCloudLayer[]
  cover?: string
  dewp?: number
  elev?: number
  fltCat?: 'VFR' | 'MVFR' | 'IFR' | 'LIFR'
  icaoId: string
  lat: number
  lon: number
  metarType?: 'METAR' | 'SPECI'
  name: string
  obsTime?: number
  precip?: number
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
