import { mapMetarToWeatherPoints } from '../mappers/metarToWeatherPoints'
import { metarMockResponse } from './metarMockResponse'

export const temperatureMockPoints = mapMetarToWeatherPoints(
  metarMockResponse,
  'temperature',
  6,
)
