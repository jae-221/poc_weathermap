import { mapMetarToWeatherPoints } from '../mappers/metarToWeatherPoints'
import { metarMockResponse } from './metarMockResponse'

export const windMockPoints = mapMetarToWeatherPoints(
  metarMockResponse,
  'wind',
  6,
)
