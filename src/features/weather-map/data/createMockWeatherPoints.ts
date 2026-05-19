import type { WeatherPoint } from '../types/weatherMap.types'

type MockCluster = {
  center: Pick<WeatherPoint, 'lat' | 'lng'>
  intensity: number
  radiusLat: number
  radiusLng: number
}

type MockGridOptions = {
  cols: number
  latRange: [min: number, max: number]
  lngRange: [min: number, max: number]
  maxWeight?: number
  minWeight?: number
  rows: number
  signal: (lat: number, lng: number) => number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function roundPoint(value: number) {
  return Number(value.toFixed(4))
}

function roundWeight(value: number) {
  return Number(value.toFixed(2))
}

function seededNoise(lat: number, lng: number) {
  const raw = Math.sin(lat * 12.9898 + lng * 78.233) * 43758.5453
  return raw - Math.floor(raw)
}

export function createClusteredMockPoints(
  clusters: MockCluster[],
  pointsPerCluster: number,
): WeatherPoint[] {
  return clusters.flatMap((cluster, clusterIndex) =>
    Array.from({ length: pointsPerCluster }, (_, pointIndex) => {
      const angle = pointIndex * 2.399963 + clusterIndex * 0.41
      const ring = Math.sqrt((pointIndex + 0.5) / pointsPerCluster)
      const lat = cluster.center.lat + Math.sin(angle) * ring * cluster.radiusLat
      const lng = cluster.center.lng + Math.cos(angle) * ring * cluster.radiusLng
      const noise = seededNoise(lat, lng)
      const centerBias = 1 - ring * 0.58
      const weight = clamp(cluster.intensity * centerBias + noise * 0.18, 0.06, 1)

      return {
        lat: roundPoint(lat),
        lng: roundPoint(lng),
        weight: roundWeight(weight),
      }
    }),
  )
}

export function createGridMockPoints({
  cols,
  latRange,
  lngRange,
  maxWeight = 1,
  minWeight = 0.05,
  rows,
  signal,
}: MockGridOptions): WeatherPoint[] {
  const [minLat, maxLat] = latRange
  const [minLng, maxLng] = lngRange

  return Array.from({ length: rows * cols }, (_, index) => {
    const row = Math.floor(index / cols)
    const col = index % cols
    const latProgress = rows === 1 ? 0 : row / (rows - 1)
    const lngProgress = cols === 1 ? 0 : col / (cols - 1)
    const lat = minLat + (maxLat - minLat) * latProgress
    const lng = minLng + (maxLng - minLng) * lngProgress
    const noise = (seededNoise(lat, lng) - 0.5) * 0.16
    const weight = clamp(signal(lat, lng) + noise, minWeight, maxWeight)

    return {
      lat: roundPoint(lat),
      lng: roundPoint(lng),
      weight: roundWeight(weight),
    }
  })
}
