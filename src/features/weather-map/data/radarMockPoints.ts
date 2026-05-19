import { mapMetarToWeatherPoints } from '../mappers/metarToWeatherPoints'
import { metarMockResponse } from './metarMockResponse'

export const radarMockPoints = mapMetarToWeatherPoints(
  metarMockResponse,
  'radar',
  8,
)
