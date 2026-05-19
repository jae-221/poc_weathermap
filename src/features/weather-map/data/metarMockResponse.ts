import mockResponse from './mockResponse.json'
import { isValidMetarObservation } from '../services/aviationWeatherMetarApi'
import type { MetarObservation } from '../types/weatherMap.types'

export const metarMockResponse: MetarObservation[] = (
  mockResponse as Partial<MetarObservation>[]
).filter(isValidMetarObservation)
