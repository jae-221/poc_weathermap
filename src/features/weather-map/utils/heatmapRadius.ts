import type { WeatherLayerRadiusConfig } from '../types/weatherMap.types'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function getHeatmapRadius(
  radius: WeatherLayerRadiusConfig,
  zoom = 5,
) {
  return clamp(radius.base + (zoom - 5) * radius.scale, radius.min, radius.max)
}
