import type {
  WeatherLayerType,
  WeatherStation,
} from '../types/weatherMap.types'
import { WeatherStationMarker } from './WeatherStationMarker'

type WeatherStationMarkerLayerProps = {
  onSelectStation: (station: WeatherStation) => void
  selectedLayer: WeatherLayerType
  selectedStationId: string | null
  stations: WeatherStation[]
}

export function WeatherStationMarkerLayer({
  onSelectStation,
  selectedLayer,
  selectedStationId,
  stations,
}: WeatherStationMarkerLayerProps) {
  if (stations.length === 0) {
    return null
  }

  return (
    <>
      {stations.map((station) => (
        <WeatherStationMarker
          isSelected={station.id === selectedStationId}
          key={station.id}
          onSelectStation={onSelectStation}
          selectedLayer={selectedLayer}
          station={station}
        />
      ))}
    </>
  )
}
