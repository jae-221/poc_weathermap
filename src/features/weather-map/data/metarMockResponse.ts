import mockResponse from './mockResponse.json'
import type { MetarObservation } from '../types/weatherMap.types'

function hasValidLocation(
  observation: Partial<MetarObservation>,
): observation is MetarObservation {
  return (
    typeof observation.icaoId === 'string' &&
    typeof observation.name === 'string' &&
    typeof observation.lat === 'number' &&
    Number.isFinite(observation.lat) &&
    typeof observation.lon === 'number' &&
    Number.isFinite(observation.lon)
  )
}

export const metarMockResponse: MetarObservation[] = (
  mockResponse as Partial<MetarObservation>[]
).filter(hasValidLocation)
