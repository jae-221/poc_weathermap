import { AdvancedMarker } from '@vis.gl/react-google-maps'
import type { CSSProperties } from 'react'
import type {
  RainCondition,
  WeatherLayerType,
  WeatherSeverity,
  WeatherStation,
} from '../types/weatherMap.types'
import { getHighestSeverity } from '../utils/weatherSeverity'

type WeatherStationMarkerProps = {
  isSelected: boolean
  onSelectStation: (station: WeatherStation) => void
  selectedLayer: WeatherLayerType
  station: WeatherStation
}

type WeatherStationMarkerIcon =
  | 'cloud'
  | 'heavy-rain'
  | 'light-rain'
  | 'nearby-shower'
  | 'rain'
  | 'recent-rain'
  | 'sun'
  | 'sun-cloud'
  | 'temperature'
  | 'thunderstorm'
  | 'variable-wind'
  | 'wind-arrow'

function getSeverityForLayer(
  station: WeatherStation,
  selectedLayer: WeatherLayerType,
): WeatherSeverity {
  if (selectedLayer === 'rain') {
    return getHighestSeverity([
      station.rain.severity,
      station.thunderstorm.severity,
    ])
  }

  if (selectedLayer === 'wind') {
    return station.wind.severity
  }

  return station.temperature.severity
}

function getMarkerContent(
  station: WeatherStation,
  selectedLayer: WeatherLayerType,
) {
  if (selectedLayer === 'rain') {
    const combinedSeverity = getSeverityForLayer(station, selectedLayer)

    if (
      station.thunderstorm.detected &&
      station.thunderstorm.severity !== 'normal' &&
      station.rain.type === 'none'
    ) {
      return {
        icon: 'thunderstorm' as WeatherStationMarkerIcon,
        label: station.thunderstorm.label,
        value: '',
      }
    }

    return {
      icon:
        station.thunderstorm.detected && combinedSeverity === 'critical'
          ? 'thunderstorm'
          : getRainIcon(station.rain, combinedSeverity),
      label: station.rain.label,
      value: '',
    }
  }

  if (selectedLayer === 'wind') {
    const direction = station.wind.direction
    const isVariable = direction === 'VRB'

    return {
      icon: (isVariable
        ? 'variable-wind'
        : 'wind-arrow') as WeatherStationMarkerIcon,
      isVariableWind: isVariable,
      label: station.wind.label,
      value: station.wind.speedKt === null ? 'N/A' : `${station.wind.speedKt} kt`,
      windRotation:
        typeof direction === 'number'
          ? ({ '--wind-direction': `${direction}deg` } as CSSProperties)
          : undefined,
    }
  }

  return {
    icon: 'temperature' as WeatherStationMarkerIcon,
    label: station.temperature.label,
    value:
      station.temperature.tempC === null
        ? 'N/A'
        : `${Math.round(station.temperature.tempC)}°C`,
  }
}

function getRainIcon(
  rain: RainCondition,
  severity = rain.severity,
): WeatherStationMarkerIcon {
  if (rain.icon === 'thunderstorm') {
    return 'thunderstorm'
  }

  if (rain.icon === 'heavy-rain') {
    return 'heavy-rain'
  }

  if (rain.icon === 'rain') {
    return 'rain'
  }

  if (rain.icon === 'light-rain') {
    return 'light-rain'
  }

  if (rain.icon === 'nearby-shower') {
    return 'nearby-shower'
  }

  if (rain.icon === 'recent-rain') {
    return 'recent-rain'
  }

  if (severity === 'normal') {
    return 'sun'
  }

  if (severity === 'caution') {
    return 'sun-cloud'
  }

  if (severity === 'warning') {
    return 'cloud'
  }

  return 'cloud'
}

function renderMarkerIcon(icon: WeatherStationMarkerIcon) {
  if (icon === 'sun') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 5.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM11 1h2v3h-2V1zm0 19h2v3h-2v-3zM1 11h3v2H1v-2zm19 0h3v2h-3v-2zM4.2 2.8l2.1 2.1-1.4 1.4-2.1-2.1 1.4-1.4zm14.9 14.9 2.1 2.1-1.4 1.4-2.1-2.1 1.4-1.4zm.7-14.9 1.4 1.4-2.1 2.1-1.4-1.4 2.1-2.1zM4.9 17.7l1.4 1.4-2.1 2.1-1.4-1.4 2.1-2.1z" />
      </svg>
    )
  }

  if (icon === 'sun-cloud') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M8 3.5a4.5 4.5 0 0 1 4.2 6.1 5.4 5.4 0 0 0-3.4 2.6H7.5A4.5 4.5 0 0 1 8 3.5zm-7 4h2.2v1.8H1V7.5zm3.1-5.1 1.5 1.5-1.2 1.2-1.5-1.5 1.2-1.2zM7.2 0h1.8v2.2H7.2V0zm6.1 2.4 1.2 1.2-1.5 1.5-1.2-1.2 1.5-1.5zM8.5 20A4.5 4.5 0 0 1 9 11.02 6 6 0 0 1 20.2 14 3.2 3.2 0 0 1 19.5 20h-11z" />
      </svg>
    )
  }

  if (icon === 'wind-arrow') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 3l6 7h-4v11h-4V10H6l6-7z" />
      </svg>
    )
  }

  if (icon === 'variable-wind') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 2.8 15.4 7h-2.1v3.7h3.7V8.6L21.2 12 17 15.4v-2.1h-3.7V17h2.1L12 21.2 8.6 17h2.1v-3.7H7v2.1L2.8 12 7 8.6v2.1h3.7V7H8.6L12 2.8z" />
      </svg>
    )
  }

  if (icon === 'temperature') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M10 4a2 2 0 0 1 4 0v8.5a5 5 0 1 1-4 0V4zm2 13.5a1.6 1.6 0 0 0 1.6-1.6c0-.58-.31-1.1-.8-1.38L12 14.06l-.8.46a1.6 1.6 0 0 0 .8 2.98z" />
      </svg>
    )
  }

  if (icon === 'thunderstorm') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M7.5 17A5.5 5.5 0 0 1 8 6.02 6.5 6.5 0 0 1 20.5 9.5 4 4 0 0 1 20 17h-4.1l1.6-4h-4.2L11 20l5.4-5h-2.1l1-2H8.2L6.8 17h.7z" />
      </svg>
    )
  }

  if (icon === 'heavy-rain') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M7.5 14A4.5 4.5 0 0 1 8 5.03 6 6 0 0 1 19.6 8 3.4 3.4 0 0 1 19 14H7.5zM7 16h2l-1.8 5h-2L7 16zm5 0h2l-1.8 5h-2L12 16zm5 0h2l-1.8 5h-2L17 16z" />
      </svg>
    )
  }

  if (icon === 'rain' || icon === 'recent-rain') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M7.5 14A4.5 4.5 0 0 1 8 5.03 6 6 0 0 1 19.6 8 3.4 3.4 0 0 1 19 14H7.5zM8 16h1.8l-1.2 4H6.8L8 16zm4.4 0h1.8L13 20h-1.8l1.2-4zm4.4 0h1.8l-1.2 4h-1.8l1.2-4z" />
      </svg>
    )
  }

  if (icon === 'light-rain' || icon === 'nearby-shower') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M7.5 14A4.5 4.5 0 0 1 8 5.03 6 6 0 0 1 19.6 8 3.4 3.4 0 0 1 19 14H7.5zM9 16h1.6l-1 3.5H8L9 16zm5.4 0H16l-1 3.5h-1.6l1-3.5z" />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M7.5 16A5.5 5.5 0 0 1 8 5.02 6.5 6.5 0 0 1 20.5 8.5 4 4 0 0 1 20 16H7.5z" />
    </svg>
  )
}

export function WeatherStationMarker({
  isSelected,
  onSelectStation,
  selectedLayer,
  station,
}: WeatherStationMarkerProps) {
  const severity = getSeverityForLayer(station, selectedLayer)
  const markerContent = getMarkerContent(station, selectedLayer)
  const overallSeverityClass =
    selectedLayer === 'rain'
      ? `weather-station-marker--overall-${severity}`
      : selectedLayer === 'wind'
        ? ''
        : `weather-station-marker--overall-${station.overallSeverity}`

  return (
    <AdvancedMarker
      onClick={() => onSelectStation(station)}
      position={{ lat: station.lat, lng: station.lng }}
      title={
        selectedLayer === 'rain'
          ? undefined
          : `${station.id} ${markerContent.label}`
      }
    >
      <div
        aria-label={`${station.id}: ${markerContent.label}`}
        className={[
          'weather-station-marker',
          `weather-station-marker--${selectedLayer}`,
          `weather-station-marker--${severity}`,
          overallSeverityClass,
          isSelected ? 'weather-station-marker--selected' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="button"
        tabIndex={0}
      >
        <span
          className={[
            'weather-station-marker__icon',
            selectedLayer === 'wind' && !markerContent.isVariableWind
              ? 'weather-station-marker__icon--wind-arrow'
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={markerContent.windRotation}
        >
          {renderMarkerIcon(markerContent.icon)}
        </span>
        {selectedLayer === 'rain' ? null : (
          <span className="weather-station-marker__value">
            {markerContent.value || station.id}
          </span>
        )}
        <span
          aria-hidden="true"
          className="weather-station-marker__overall-badge"
        />
      </div>
    </AdvancedMarker>
  )
}
