import mockResponse from './mockResponse.json'
import type { MetarObservation } from '../types/weatherMap.types'

function hasValidLocation(
  observation: Partial<MetarObservation>,
): observation is MetarObservation {
  return (
    typeof observation.icaoId === 'string' &&
    typeof observation.name === 'string' &&
    typeof observation.lat === 'number' &&
    typeof observation.lon === 'number'
  )
}

export const metarMockResponse: MetarObservation[] = (
  mockResponse as Partial<MetarObservation>[]
).filter(hasValidLocation)
