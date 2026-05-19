import { radarMockPoints } from '../data/radarMockPoints'
import { rainMockPoints } from '../data/rainMockPoints'
import { temperatureMockPoints } from '../data/temperatureMockPoints'
import { thunderstormMockPoints } from '../data/thunderstormMockPoints'
import { windMockPoints } from '../data/windMockPoints'
import type {
  WeatherLayerConfig,
} from '../types/weatherMap.types'

export const weatherLayerConfigs: WeatherLayerConfig[] = [
  {
    id: 'radar',
    label: 'Weather Radar',
    points: radarMockPoints,
    thumbClassName: 'weather-layer-thumb-radar',
    gradient: [
      'rgba(0, 90, 255, 0)',
      'rgba(0, 140, 255, 0.65)',
      'rgba(0, 210, 120, 0.78)',
      'rgba(255, 230, 40, 0.86)',
      'rgba(255, 70, 40, 0.94)',
    ],
    maxIntensity: 1,
    opacity: 0.66,
    radius: {
      base: 56,
      min: 18,
      max: 104,
      scale: 8,
    },
  },
  {
    id: 'wind',
    label: 'Wind',
    points: windMockPoints,
    thumbClassName: 'weather-layer-thumb-wind',
    gradient: [
      'rgba(0, 220, 255, 0)',
      'rgba(0, 210, 255, 0.58)',
      'rgba(30, 100, 255, 0.78)',
      'rgba(130, 60, 220, 0.9)',
    ],
    maxIntensity: 1,
    opacity: 0.58,
    radius: {
      base: 50,
      min: 18,
      max: 96,
      scale: 7,
    },
  },
  {
    id: 'rain',
    label: 'Rain',
    points: rainMockPoints,
    thumbClassName: 'weather-layer-thumb-rain',
    gradient: [
      'rgba(80, 190, 255, 0)',
      'rgba(100, 210, 255, 0.58)',
      'rgba(35, 130, 255, 0.78)',
      'rgba(20, 60, 210, 0.92)',
    ],
    maxIntensity: 1,
    opacity: 0.62,
    radius: {
      base: 42,
      min: 14,
      max: 82,
      scale: 6,
    },
  },
  {
    id: 'temperature',
    label: 'Temperature',
    points: temperatureMockPoints,
    thumbClassName: 'weather-layer-thumb-temperature',
    gradient: [
      'rgba(50, 120, 255, 0)',
      'rgba(35, 200, 255, 0.58)',
      'rgba(255, 230, 80, 0.76)',
      'rgba(255, 145, 45, 0.86)',
      'rgba(235, 40, 45, 0.94)',
    ],
    maxIntensity: 1,
    opacity: 0.54,
    radius: {
      base: 74,
      min: 28,
      max: 128,
      scale: 9,
    },
  },
  {
    id: 'thunderstorm',
    label: 'Thunderstorm',
    points: thunderstormMockPoints,
    thumbClassName: 'weather-layer-thumb-thunderstorm',
    gradient: [
      'rgba(255, 235, 60, 0)',
      'rgba(255, 220, 40, 0.68)',
      'rgba(255, 115, 30, 0.84)',
      'rgba(220, 30, 50, 0.94)',
      'rgba(130, 35, 190, 1)',
    ],
    maxIntensity: 1,
    opacity: 0.68,
    radius: {
      base: 36,
      min: 12,
      max: 74,
      scale: 5,
    },
  },
]
