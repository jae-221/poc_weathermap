import { useEffect } from 'react'
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps'
import type { WeatherPoint } from '../types/weatherMap.types'

type WeatherHeatmapLayerProps = {
  points: WeatherPoint[]
}

function toWeightedLocations(
  points: WeatherPoint[],
  LatLng: google.maps.CoreLibrary['LatLng'],
) {
  return points.map((point) => ({
    location: new LatLng(point.lat, point.lng),
    weight: point.weight,
  }))
}

export function WeatherHeatmapLayer({ points }: WeatherHeatmapLayerProps) {
  const map = useMap()
  const core = useMapsLibrary('core')
  const visualization = useMapsLibrary('visualization')

  useEffect(() => {
    if (!map || !core || !visualization || points.length === 0) {
      return
    }

    const heatmapLayer = new visualization.HeatmapLayer({
      data: toWeightedLocations(points, core.LatLng),
      dissipating: true,
      radius: 148,
    })

    heatmapLayer.setMap(map)

    return () => {
      heatmapLayer.setMap(null)
    }
  }, [core, map, points, visualization])

  if (points.length === 0) {
    return (
      <div className="weather-map-status" role="status">
        No weather data is available for the heatmap.
      </div>
    )
  }

  if (!map) {
    return (
      <div className="weather-map-status" role="status">
        Preparing Google Map before rendering the heatmap.
      </div>
    )
  }

  if (!core || !visualization) {
    return (
      <div className="weather-map-status" role="status">
        Loading Google Maps visualization library.
      </div>
    )
  }

  return null
}
