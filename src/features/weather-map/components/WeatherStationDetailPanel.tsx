import type { WeatherSeverity, WeatherStation } from '../types/weatherMap.types'
import type { WeatherLayerType } from '../types/weatherMap.types'
import { getHighestSeverity } from '../utils/weatherSeverity'

type WeatherStationDetailPanelProps = {
  onClose: () => void
  selectedLayer: WeatherLayerType
  station: WeatherStation
}

type DetailItem = {
  label: string
  value: string
}

function formatNullable(value: number | string | null | undefined, suffix = '') {
  if (value === null || value === undefined || value === '') {
    return 'N/A'
  }

  return `${value}${suffix}`
}

function formatBoolean(value: boolean) {
  return value ? 'Yes' : 'No'
}

function formatSeverity(severity: WeatherSeverity) {
  return severity.charAt(0).toUpperCase() + severity.slice(1)
}

function formatThunderstormSource(source: WeatherStation['thunderstorm']['source']) {
  return source === 'none' ? 'N/A' : source
}

function getDetailSeverity(
  station: WeatherStation,
  selectedLayer: WeatherLayerType,
) {
  if (selectedLayer === 'rain') {
    return getHighestSeverity([
      station.rain.severity,
      station.thunderstorm.severity,
    ])
  }

  if (selectedLayer === 'wind') {
    return station.wind.severity
  }

  return station.overallSeverity
}

function formatCloudLayers(station: WeatherStation) {
  if (station.cloud.layers.length === 0) {
    return 'N/A'
  }

  return station.cloud.layers
    .map((layer) =>
      [layer.cover, layer.base === null ? null : `${layer.base} ft`]
        .filter(Boolean)
        .join(' '),
    )
    .join(', ')
}

function DetailSection({
  items,
  title,
}: {
  items: DetailItem[]
  title: string
}) {
  return (
    <section className="weather-station-detail__section">
      <h3>{title}</h3>
      <dl>
        {items.map((item) => (
          <div className="weather-station-detail__row" key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export function WeatherStationDetailPanel({
  onClose,
  selectedLayer,
  station,
}: WeatherStationDetailPanelProps) {
  const shouldShowSeverityStatus = selectedLayer !== 'temperature'
  const detailSeverity = getDetailSeverity(station, selectedLayer)

  return (
    <aside
      aria-label={`${station.id} weather station detail`}
      className="weather-station-detail"
    >
      <header className="weather-station-detail__header">
        <div>
          <p className="weather-station-detail__eyebrow">Station</p>
          <h2>{station.id}</h2>
          <span>{formatNullable(station.name)}</span>
        </div>
        <button
          aria-label="Close station detail"
          className="weather-station-detail__close"
          onClick={onClose}
          type="button"
        >
          X
        </button>
      </header>

      {shouldShowSeverityStatus ? (
        <div
          className={[
            'weather-station-detail__severity',
            `weather-station-detail__severity--${detailSeverity}`,
          ].join(' ')}
        >
          {formatSeverity(detailSeverity)}
        </div>
      ) : null}

      <div className="weather-station-detail__content">
        <DetailSection
          items={[
            { label: 'ICAO', value: station.id },
            { label: 'Site name', value: formatNullable(station.name) },
            {
              label: 'Observation time',
              value: formatNullable(station.observationTime),
            },
            {
              label: 'Flight category',
              value: formatNullable(station.flightCategory),
            },
          ]}
          title="Station"
        />

        {shouldShowSeverityStatus ? (
          <DetailSection
            items={[
              {
                label:
                  selectedLayer === 'rain'
                    ? 'Rain / storm severity'
                    : selectedLayer === 'wind'
                      ? 'Wind severity'
                    : 'Overall severity',
                value: formatSeverity(detailSeverity),
              },
            ]}
            title="Weather Status"
          />
        ) : null}

        <DetailSection
          items={
            shouldShowSeverityStatus
              ? [
                  { label: 'Label', value: station.rain.label },
                  {
                    label: 'Severity',
                    value: formatSeverity(station.rain.severity),
                  },
                ]
              : [{ label: 'Label', value: station.rain.label }]
          }
          title="Rain / Storm"
        />

        <DetailSection
          items={[
            {
              label: 'Direction',
              value: formatNullable(station.wind.direction),
            },
            {
              label: 'Speed',
              value: formatNullable(station.wind.speedKt, ' kt'),
            },
            { label: 'Gust', value: formatNullable(station.wind.gustKt, ' kt') },
          ]}
          title="Wind"
        />

        <DetailSection
          items={[
            {
              label: 'Detected',
              value: formatBoolean(station.thunderstorm.detected),
            },
            {
              label: 'Source',
              value: formatThunderstormSource(station.thunderstorm.source),
            },
            ...(shouldShowSeverityStatus
              ? [
                  {
                    label: 'Severity',
                    value: formatSeverity(station.thunderstorm.severity),
                  },
                ]
              : []),
          ]}
          title="Storm Signal"
        />

        <DetailSection
          items={[
            {
              label: 'Temperature',
              value: formatNullable(station.temperature.tempC, '°C'),
            },
            {
              label: 'Dew point',
              value: formatNullable(station.temperature.dewpointC, '°C'),
            },
          ]}
          title="Temperature"
        />

        <DetailSection
          items={[
            { label: 'Cover', value: formatNullable(station.cloud.cover) },
            {
              label: 'Ceiling',
              value: formatNullable(station.cloud.ceilingFt, ' ft'),
            },
            { label: 'Cloud layers', value: formatCloudLayers(station) },
            { label: 'CB signal', value: formatBoolean(station.cloud.hasCb) },
            { label: 'TCU signal', value: formatBoolean(station.cloud.hasTcu) },
          ]}
          title="Cloud"
        />

        <DetailSection
          items={[
            {
              label: 'Visibility',
              value: formatNullable(station.visibility),
            },
          ]}
          title="Visibility"
        />

        <section className="weather-station-detail__section">
          <h3>Raw METAR</h3>
          <pre>{formatNullable(station.rawOb)}</pre>
        </section>
      </div>
    </aside>
  )
}
