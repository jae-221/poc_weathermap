import type { WeatherLayerConfig } from '../types/weatherMap.types'

export const weatherLayerConfigs: WeatherLayerConfig[] = [
  {
    description: 'Station rain, shower, thunderstorm, and convective status from METAR',
    id: 'rain',
    label: 'Rain / Storm',
  },
  {
    description: 'Station wind speed, gust, and direction from METAR wind fields',
    id: 'wind',
    label: 'Wind',
  },
  {
    description: 'Station temperature and dew point in Celsius',
    id: 'temperature',
    label: 'Temp',
  },
]
