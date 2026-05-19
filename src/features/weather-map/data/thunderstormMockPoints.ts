import { mapMetarToWeatherPoints } from '../mappers/metarToWeatherPoints'
import { metarMockResponse } from './metarMockResponse'

export const thunderstormMockPoints = mapMetarToWeatherPoints(
  metarMockResponse,
  'thunderstorm',
  8,
)
