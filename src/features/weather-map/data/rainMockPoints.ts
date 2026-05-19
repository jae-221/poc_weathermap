import { mapMetarToWeatherPoints } from '../mappers/metarToWeatherPoints'
import { metarMockResponse } from './metarMockResponse'

export const rainMockPoints = mapMetarToWeatherPoints(
  metarMockResponse,
  'rain',
  8,
)
