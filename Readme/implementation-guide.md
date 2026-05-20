# Weather Map Implementation Guide

เอกสารนี้เป็นคู่มือสำหรับทำความเข้าใจระบบ ตำแหน่งไฟล์สำคัญ วิธีไล่ data flow และแนวทาง implement ต่อในโปรเจกต์ Weather Map POC

## เป้าหมายของโปรเจกต์

โปรเจกต์นี้เป็น POC สำหรับแสดงข้อมูลอากาศบน Google Maps ด้วยข้อมูล METAR จาก AviationWeather API

ทิศทาง requirement ปัจจุบันคือ **station-based operational weather map**:

- METAR ต้องถูกมองเป็น station observation
- แสดงข้อมูลที่ตำแหน่งจริงของแต่ละ METAR station เท่านั้น
- ไม่สร้าง artificial points รอบสถานี
- ไม่ใช้ heatmap เพื่อสื่อว่า weather condition ครอบคลุมพื้นที่กว้าง
- ใช้ marker, icon, badge, severity และ detail panel แทน area-spreading heatmap

โหมดหลักของ phase ใหม่:

- `Rain`
- `Wind`
- `Thunderstorm`
- `Temperature`

Cloud data ยังควรเก็บไว้ใน station detail และ future phase แต่ยังไม่ใช่ active mode หลัก

### Current Runtime State

โค้ด runtime ปัจจุบันยังเป็น legacy heatmap flow ระหว่าง migration:

- แสดง Google Map ผ่าน `@vis.gl/react-google-maps`
- Fetch METAR จาก AviationWeather ผ่าน Vite proxy
- แปลง METAR observations เป็น weighted heatmap points
- แสดง heatmap ตาม layer ที่เลือก
- มี cache ใน `localStorage` เพื่อลดการเรียก API ซ้ำ
- ไม่มี mock weather data ใน runtime แล้ว

Layer heatmap ที่ยังมีในโค้ดปัจจุบัน:

- `Temperature`
- `Wind`
- `Rain`
- `Thunderstorm`
- `Visibility`
- `Fog`
- `Cloud coverage`

หมายเหตุสำคัญ:

- Heatmap flow นี้เป็น legacy/POC และควรถูกแทนด้วย station marker flow ตาม `Readme/Tasks.md`
- Weather Radar ถูกเอาออกแล้ว เพราะข้อมูล METAR ไม่ใช่ radar raster จริง
- ถ้าต้องการ radar หรือ global smooth weather layer ในอนาคต ควรใช้ weather tile/raster provider แยกต่างหาก

## Tech Stack

- React
- TypeScript
- Vite
- Google Maps JavaScript API
- `@vis.gl/react-google-maps`
- AviationWeather METAR GeoJSON API
- Google Maps Visualization Library สำหรับ legacy `HeatmapLayer`

หมายเหตุ: Google Maps Heatmap Layer ถูก deprecate แล้ว และไม่เหมาะกับ operational METAR station observation ใน phase ใหม่

## Setup

ติดตั้ง dependencies:

```bash
npm install
```

สร้างไฟล์ `.env`:

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

รัน dev server:

```bash
npm run dev
```

ตรวจคุณภาพโค้ด:

```bash
npm run lint
npm run build
```

ห้าม commit `.env` เพราะมี API key

## API ที่ใช้อยู่

โปรเจกต์เรียก METAR endpoint นี้:

```txt
https://aviationweather.gov/api/data/metar?bbox=5.5,97.0,20.5,106.0&format=geojson
```

แต่ใน browser จะไม่ได้เรียก domain นี้ตรง ๆ เพราะอาจติด CORS จึงเรียกผ่าน Vite dev proxy:

```txt
/api/aviationweather/metar?bbox=5.5%2C97.0%2C20.5%2C106.0&format=geojson
```

proxy อยู่ใน `vite.config.ts`:

```ts
server: {
  proxy: {
    '/api/aviationweather': {
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/aviationweather/, '/api/data'),
      target: 'https://aviationweather.gov',
    },
  },
}
```

ดังนั้น request จากแอปจะถูกส่งต่อเป็น:

```txt
https://aviationweather.gov/api/data/metar?bbox=5.5,97.0,20.5,106.0&format=geojson
```

สำหรับ production ต้องทำ proxy ฝั่ง backend, serverless function หรือ deployment rewrite เอง เพราะ Vite proxy ใช้เฉพาะตอน development

## โครงสร้างไฟล์สำคัญ

```txt
src/
├── app/
│   ├── App.tsx
│   └── App.css
│
├── config/
│   └── env.ts
│
├── features/
│   └── weather-map/
│       ├── components/
│       │   ├── WeatherMap.tsx
│       │   ├── WeatherMap.css
│       │   └── WeatherHeatmapLayer.tsx
│       │
│       ├── config/
│       │   └── weatherLayerConfigs.ts
│       │
│       ├── hooks/
│       │   └── useMetarWeatherLayers.ts
│       │
│       ├── mappers/
│       │   └── metarToWeatherPoints.ts
│       │
│       ├── services/
│       │   └── aviationWeatherMetarApi.ts
│       │
│       ├── types/
│       │   └── weatherMap.types.ts
│       │
│       ├── utils/
│       │   ├── createWeatherPointClusters.ts
│       │   └── heatmapRadius.ts
│       │
│       └── index.ts
│
├── styles/
│   └── global.css
│
└── main.tsx
```

## Data Flow

ภาพรวมการไหลของข้อมูลปัจจุบันใน legacy heatmap flow:

```txt
WeatherMap.tsx
  ↓ calls hook
useMetarWeatherLayers.ts
  ↓ fetches data
aviationWeatherMetarApi.ts
  ↓ fetches GeoJSON and returns MetarObservation[]
metarToWeatherPoints.ts
  ↓ maps observations by selected weather layer
createWeatherPointClusters.ts
  ↓ creates weighted points around each station
WeatherHeatmapLayer.tsx
  ↓ renders Google Maps HeatmapLayer
Google Map
```

target data flow ตาม requirement ใหม่ควรเป็น:

```txt
WeatherMap.tsx
  ↓ calls hook
useMetarWeatherLayers.ts
  ↓ fetches data
aviationWeatherMetarApi.ts
  ↓ fetches GeoJSON and returns MetarObservation[]
metarToWeatherStations.ts
  ↓ maps observations to WeatherStation[]
WeatherStationMarkerLayer.tsx
  ↓ renders one marker per station
WeatherStationDetailPanel.tsx
  ↓ shows selected station detail
Google Map
```

ให้อ่านทั้ง current flow และ target flow ก่อนแก้ เพราะ phase ใหม่คือ migration จาก heatmap ไป station marker

## File Responsibilities

### `src/config/env.ts`

เป็นจุดกลางสำหรับอ่าน environment variables

```ts
export const env = {
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
}
```

ถ้าต้องเพิ่ม env ใหม่ ให้เพิ่มที่ไฟล์นี้ก่อน แล้วค่อย import `env` ไปใช้ใน component หรือ service

### `src/features/weather-map/components/WeatherMap.tsx`

เป็น component หลักของ feature

หน้าที่:

- ตรวจว่า `VITE_GOOGLE_MAPS_API_KEY` มีค่าหรือไม่
- render `APIProvider`
- render `Map`
- เรียก `useMetarWeatherLayers()`
- เก็บ state ของ layer ที่เลือก
- แสดงปุ่มเลือก layer
- ส่ง config และ points เข้า `WeatherHeatmapLayer`
- แสดง status เช่น loading, cache, error

ค่า default layer ตอนนี้คือ:

```ts
useState<WeatherLayerType>('temperature')
```

ถ้าต้องการเปลี่ยน layer ที่เปิดมาครั้งแรก ให้แก้ตรงนี้ แต่ค่าต้องเป็นหนึ่งใน `WeatherLayerType`

### `src/features/weather-map/components/WeatherHeatmapLayer.tsx`

เป็นตัวเชื่อม React กับ Google Maps HeatmapLayer

หน้าที่:

- อ่าน map instance ด้วย `useMap()`
- โหลด Google Maps library ด้วย `useMapsLibrary('core')` และ `useMapsLibrary('visualization')`
- แปลง `WeatherPoint[]` เป็น `WeightedLocation[]`
- สร้าง `new visualization.HeatmapLayer(...)`
- attach layer เข้า map ด้วย `heatmapLayer.setMap(map)`
- cleanup ตอน component unmount หรือเปลี่ยน layer ด้วย `heatmapLayer.setMap(null)`

ถ้า heatmap ไม่ขึ้น ให้เช็กตามลำดับนี้:

1. `points.length` มากกว่า 0 หรือไม่
2. Google Maps โหลดสำเร็จหรือไม่
3. visualization library โหลดสำเร็จหรือไม่
4. radius/opacity/gradient ใน layer config มองเห็นได้หรือไม่
5. station อยู่ใน viewport ปัจจุบันหรือไม่

### `src/features/weather-map/config/weatherLayerConfigs.ts`

เก็บ config ของแต่ละ layer

แต่ละ layer มี:

- `id`: key ที่ใช้เลือก layer
- `label`: ข้อความบนปุ่ม
- `points`: เริ่มต้นเป็น `[]` แล้ว hook จะเติมข้อมูลจริง
- `thumbClassName`: class สำหรับปุ่ม preview
- `gradient`: สีของ heatmap
- `maxIntensity`: ค่าสูงสุดของ intensity
- `opacity`: ความโปร่งใส
- `radius`: ขนาด heatmap

ตอนนี้มี layer:

```ts
wind
rain
temperature
thunderstorm
visibility
fog
cloudCoverage
```

ถ้าจะเพิ่ม layer ใหม่ ต้องแก้ 3 จุด:

1. เพิ่ม type ใน `WeatherLayerType`
2. เพิ่ม config ใน `weatherLayerConfigs.ts`
3. เพิ่ม logic mapping ใน `metarToWeatherPoints.ts`

### `src/features/weather-map/hooks/useMetarWeatherLayers.ts`

เป็น hook ที่จัดการ data lifecycle

หน้าที่:

- fetch METAR data ผ่าน `fetchMetarObservations`
- เก็บ state: loading, ready, error
- นำ observations ไปแปลงเป็น layer configs ที่มี points
- return `{ observations, source, status, error, layers }`

ตอนนี้ไม่มี mock fallback แล้ว ถ้า API fail และไม่มี stale cache จะได้:

```ts
status: 'error'
observations: []
```

### `src/features/weather-map/services/aviationWeatherMetarApi.ts`

เป็น service สำหรับคุยกับ AviationWeather API

หน้าที่:

- สร้าง URL ด้วย `getAviationWeatherMetarUrl()`
- fetch METAR data
- request AviationWeather ด้วย `format=geojson`
- แปลง `FeatureCollection` เป็น `MetarObservation[]`
  - `geometry.coordinates` เป็น `[lon, lat]`
  - `properties.id` map เป็น `icaoId`
  - `properties.site` map เป็น `name`
  - `properties.fltcat` map เป็น `fltCat`
  - `properties.wx` map เป็น `wxString`
  - field อื่นใช้ตรง ๆ เช่น `temp`, `wspd`, `clouds`, `rawOb`
- validate response เบื้องต้น
- cache successful response ลง `localStorage`
- fallback ไป stale cache ถ้า API fail

ค่าปัจจุบัน:

```ts
const AVIATION_WEATHER_BBOX = '5.5,97.0,20.5,106.0'
```

ถ้าต้องเปลี่ยน bbox ให้แก้ตรงนี้ และควรเปลี่ยน cache key ตามไปด้วย ซึ่งตอนนี้ cache key ผูกกับ `AVIATION_WEATHER_BBOX` อยู่แล้ว

### `src/features/weather-map/mappers/metarToWeatherPoints.ts`

เป็นไฟล์สำคัญที่สุดสำหรับการแปล METAR เป็น heatmap

หน้าที่:

- อ่าน field จาก `MetarObservation`
- คำนวณ signal ของแต่ละ layer
- filter station ที่ไม่มีข้อมูลสำหรับ layer นั้น
- ส่ง cluster เข้า `createWeatherPointClusters`

ตัวอย่าง:

- Temperature ใช้ `observation.temp`
- Wind ใช้ `observation.wspd` และ `observation.wgst`
- Rain ใช้ `precip`, `pcp3hr`, `wxString`, `rawOb`
- Thunderstorm ใช้ `TS`, `VCTS`, `TSRA`, visibility, gust และ flight category
- Visibility ใช้ `visib` และ `fltCat`
- Fog ใช้ `FG`, `BR`, fog-related weather codes, visibility, และ temp/dewpoint spread
- Cloud coverage ใช้ `cover`, `clouds`, `ceil` และ `fltCat`

ถ้า layer ไม่ขึ้นแม้ API มี response ให้เริ่ม debug ที่ไฟล์นี้ เพราะเป็นจุดที่ข้อมูลอาจถูก filter ออกจนหมด

### `src/features/weather-map/utils/createWeatherPointClusters.ts`

Google Heatmap จะดูชัดขึ้นถ้าแต่ละ station ไม่ใช่จุดเดียว จึงมี utility นี้ไว้สร้างกลุ่ม point รอบ station

input:

```ts
{
  center: { lat, lng },
  intensity,
  radiusLat,
  radiusLng
}
```

output:

```ts
WeatherPoint[]
```

แนวคิดคือ 1 station จะกลายเป็นหลาย weighted points เพื่อให้ heatmap ดูเป็นพื้นที่ ไม่ใช่จุดเล็ก ๆ

### `src/features/weather-map/utils/heatmapRadius.ts`

ช่วยคำนวณ radius ของ heatmap

ตอนนี้ `WeatherHeatmapLayer` ใช้ radius จาก config โดยตรง ถ้าอยากให้ radius เปลี่ยนตาม zoom ให้ต่อยอดจากไฟล์นี้

## Cache Behavior

cache อยู่ใน `localStorage`

TTL ปัจจุบัน:

```ts
METAR_CACHE_TTL_MS = 60 * 60 * 1000
```

เท่ากับ 1 ชั่วโมง

Flow:

```txt
1. เปิดหน้า
2. service เช็ก fresh cache
3. ถ้ามี cache ที่ยังไม่หมดอายุ ใช้ cache
4. ถ้าไม่มี cache เรียก AviationWeather API
5. ถ้า API สำเร็จ เก็บ cache ใหม่
6. ถ้า API fail ลองใช้ stale cache
7. ถ้า stale cache ไม่มี ส่ง error กลับไป UI
```

สำหรับ production แนะนำให้ปรับ cache เป็น:

- fresh cache: 10-15 นาที
- stale cache: 1-2 ชั่วโมง
- มี cleanup cache เก่า
- ถ้าเปลี่ยนเป็น fetch ตาม viewport ให้ normalize bbox ก่อนทำ cache key ไม่อย่างนั้น pan นิดเดียวจะเกิด cache key ใหม่จำนวนมาก

## Known Limitations

- ข้อมูล METAR เป็นข้อมูล station observation ไม่ใช่ radar จริง
- Rain และ Thunderstorm จาก METAR เป็น signal โดยประมาณ ไม่ใช่ precipitation radar
- Heatmap Layer ของ Google Maps ถูก deprecate
- Vite proxy ใช้เฉพาะ development
- bbox ตอนนี้เป็นค่าคงที่ ไม่ได้ตาม viewport
- ถ้า AviationWeather คืน `204 No Content` แปลว่าไม่มี record สำหรับ bbox นั้น ณ เวลาที่เรียก

## How To Continue Implementation

### เพิ่ม viewport-based fetch

ตอนนี้ bbox เป็นค่าคงที่ ถ้าต้องการ fetch ตาม viewport:

1. ใช้ `useMap()` ใน component ลูกของ `Map`
2. อ่าน `map.getBounds()`
3. แปลงเป็น bbox string
4. debounce หลัง pan/zoom ประมาณ 1 วินาที
5. ส่ง bounds เข้า `useMetarWeatherLayers(bounds)`
6. ทำ cache key จาก normalized bbox

อย่าใช้ bbox ดิบเป็น cache key เพราะ pan เล็กน้อยจะทำให้ cache ใช้ซ้ำไม่ได้

### เพิ่ม raster tile overlay สำหรับ global temperature

ถ้าต้องการทำ temperature แบบ global เหมือน Windy หรือ AccuWeather ไม่ควรใช้ METAR heatmap เพราะ METAR เป็นจุดสถานีและ coverage ไม่สม่ำเสมอ

แนวทางที่ควรทำ:

1. หา weather tile provider
2. ใช้ URL template เช่น `{z}/{x}/{y}.png`
3. สร้าง component ใหม่ เช่น `WeatherTileOverlayLayer.tsx`
4. ใช้ `google.maps.ImageMapType`
5. วาง layer ด้วย `map.overlayMapTypes.insertAt(...)`

METAR heatmap เหมาะกับ station observation ส่วน global smooth temperature เหมาะกับ raster tile overlay

### เพิ่ม production backend proxy

สำหรับ production ไม่ควรให้ frontend เรียก AviationWeather ตรง ๆ

ควรทำ endpoint เช่น:

```txt
/api/weather/metar?bbox=...
```

backend จะรับ request แล้ว proxy ไป:

```txt
https://aviationweather.gov/api/data/metar
```

ข้อดี:

- ควบคุม cache ได้ดีขึ้น
- ซ่อน implementation ของ provider
- จัดการ rate limit ได้
- เพิ่ม logging และ error handling ได้ง่าย

## Debug Checklist

ถ้าแผนที่ไม่ขึ้น:

- เช็ก `.env` ว่ามี `VITE_GOOGLE_MAPS_API_KEY`
- เช็กว่า Google Maps JavaScript API เปิดใน Google Cloud
- เช็กว่า billing/restriction ของ key อนุญาต localhost
- ดูข้อความใน overlay บนหน้าเว็บ

ถ้า API ไม่ได้ข้อมูล:

- เปิด Network tab
- ดู request `/api/aviationweather/metar`
- เช็ก status code
- เช็กว่า Vite proxy ทำงานหรือไม่
- ลองเปิด URL จริงของ AviationWeather ใน browser

ถ้า heatmap ไม่ขึ้น:

- เช็ก status bar ว่ามีกี่ stations
- เช็กว่า selected layer มี `points.length > 0`
- เช็ก mapper ว่า filter station ออกหมดหรือไม่
- Wind ควรเห็นง่ายสุด เพราะ METAR ส่วนใหญ่มี `wspd`
- Rain/Thunderstorm อาจไม่เห็นถ้าไม่มี weather code ณ เวลานั้น

## Validation Commands

ก่อนส่งงานทุกครั้งให้รัน:

```bash
npm run lint
npm run build
```

ถ้าแก้ UI หรือ map behavior ควรเปิด dev server แล้วทดสอบด้วย browser:

```bash
npm run dev
```

## Current Implementation Summary

สถานะล่าสุด:

- mock data ถูกลบออกจาก runtime แล้ว
- Weather Radar ถูกเอาออกจาก layer list แล้ว
- METAR data มาจาก AviationWeather API
- UI มี layer selector สำหรับ Temperature, Wind, Rain และ Thunderstorm
- cache ยังเป็น localStorage TTL 1 ชั่วโมง
- ยังไม่ได้ implement viewport-based bbox ใน branch ปัจจุบัน
