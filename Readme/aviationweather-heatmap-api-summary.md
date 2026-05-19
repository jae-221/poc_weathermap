# AviationWeather API สำหรับ Heat Map

เอกสารนี้สรุปข้อมูลจาก AviationWeather.gov Data API สำหรับใช้ทำแผนที่อากาศการบิน โดยเน้นข้อมูลที่เหมาะกับ heat map, risk map, polygon overlay และการใช้งาน API ในแอปหรือ backend

แหล่งอ้างอิงหลัก:

- Data API docs: https://aviationweather.gov/data/api/
- OpenAPI schema: https://aviationweather.gov/data/schema/openapi.yaml

## ภาพรวม API

Base URL:

```text
https://aviationweather.gov/api/data
```

รูปแบบการเรียก:

```text
https://aviationweather.gov/api/data/{endpoint}?{query_params}
```

ตัวอย่าง:

```text
https://aviationweather.gov/api/data/metar?ids=VTBS&format=json
https://aviationweather.gov/api/data/metar?bbox=97,5,106,21&format=geojson
https://aviationweather.gov/api/data/gairmet?format=geojson&hazard=ice
```

## ข้อมูลที่เหมาะนำไปแสดง Heat Map

### 1. METAR: สภาพอากาศปัจจุบันรายสนามบิน

Endpoint:

```text
/api/data/metar
```

ใช้ทำอะไร:

METAR คือข้อมูลสภาพอากาศจริง ณ สถานีตรวจอากาศหรือสนามบิน เช่น อุณหภูมิ ลม visibility cloud ceiling และ flight category ข้อมูลนี้เหมาะที่สุดสำหรับ heat map แบบจุดสถานี แล้วนำไป interpolate เป็นผืนสีต่อเนื่องได้

เหมาะใช้แสดง:

- Temperature heat map จาก `temp`
- Dew point heat map จาก `dewp`
- Wind speed heat map จาก `wspd`
- Wind gust heat map จาก `wgst`
- Visibility heat map จาก `visib`
- Pressure/altimeter map จาก `altim` หรือ `slp`
- Cloud ceiling map จาก `clouds[].base`
- Flight category risk map จาก `fltCat` เช่น VFR, MVFR, IFR, LIFR
- Precipitation/snow depth map ถ้ามีค่าในรายงาน เช่น `precip`, `snow`

พารามิเตอร์สำคัญ:

| Parameter | ความหมาย |
|---|---|
| `ids` | รหัสสถานีหรือสนามบิน ICAO เช่น `VTBS`, `KJFK`, `KMCI` |
| `bbox` | กรอบพื้นที่ค้นหา เหมาะกับดึงหลายสถานีในพื้นที่ |
| `format` | `raw`, `decoded`, `json`, `geojson`, `xml`, `iwxxm` |
| `taf` | include TAF มาพร้อม METAR |
| `hours` | จำนวนชั่วโมงย้อนหลัง |
| `date` | เวลาเฉพาะที่ต้องการค้นหา |

ตัวอย่าง:

```text
https://aviationweather.gov/api/data/metar?ids=VTBS&format=json
https://aviationweather.gov/api/data/metar?bbox=97,5,106,21&format=geojson
```

คำแนะนำสำหรับ heat map:

ถ้าทำ frontend map ให้ใช้ `format=geojson` เพราะได้ geometry พร้อมพิกัด ถ้าอยาก parse ค่าแบบง่ายใช้ `format=json` ซึ่งมี `lat` และ `lon` ให้เช่นกัน

### 2. TAF: พยากรณ์อากาศรายสนามบิน

Endpoint:

```text
/api/data/taf
```

ใช้ทำอะไร:

TAF คือ Terminal Aerodrome Forecast หรือพยากรณ์อากาศสนามบิน ใช้แสดงสภาพอากาศล่วงหน้า เช่น ลม visibility cloud ceiling และ weather condition ตามช่วงเวลา เหมาะกับ forecast heat map

เหมาะใช้แสดง:

- Forecast wind speed
- Forecast visibility
- Forecast ceiling
- Forecast weather condition
- Forecast flight risk score
- Timeline map เช่น now, +3h, +6h, +12h

พารามิเตอร์สำคัญ:

| Parameter | ความหมาย |
|---|---|
| `ids` | รหัสสถานีหรือสนามบิน ICAO |
| `bbox` | ค้นหาตามกรอบพื้นที่ |
| `format` | `raw`, `json`, `geojson`, `xml`, `iwxxm` |
| `metar` | include METAR มาพร้อม TAF |
| `time` | เลือกประมวลผลตาม `valid` หรือ `issue` time |
| `date` | เวลาเฉพาะที่ต้องการค้นหา |

ตัวอย่าง:

```text
https://aviationweather.gov/api/data/taf?ids=VTBS&format=json
https://aviationweather.gov/api/data/taf?bbox=97,5,106,21&format=geojson
```

คำแนะนำสำหรับ heat map:

ควรแปลง forecast แต่ละช่วงเวลาเป็น time slice แล้วให้ผู้ใช้เลือกเวลาบนแผนที่ เช่น forecast visibility ที่ +6 ชั่วโมง

### 3. PIREP/AIREP: รายงานจากนักบินหรือเครื่องบิน

Endpoint:

```text
/api/data/pirep
```

ใช้ทำอะไร:

PIREP/AIREP คือรายงานสภาพอากาศจากนักบินหรือเครื่องบิน เช่น turbulence, icing, cloud, visibility, wind, temperature และ flight level ข้อมูลนี้เหมาะกับ heat map ความเสี่ยงจากรายงานจริง แต่ความหนาแน่นของข้อมูลขึ้นกับจำนวนรายงานในพื้นที่

เหมาะใช้แสดง:

- Turbulence report heat map
- Icing report heat map
- Hazard density map
- Severity map จาก intensity เช่น light, moderate, severe
- Flight level risk map
- Cloud/tops/base report map

พารามิเตอร์สำคัญ:

| Parameter | ความหมาย |
|---|---|
| `id` | ใช้สนามบินเป็นจุดศูนย์กลางในการค้นหา |
| `distance` | ระยะรัศมีค้นหา |
| `bbox` | ค้นหาตามกรอบพื้นที่ |
| `format` | `raw`, `decoded`, `json`, `geojson`, `xml` |
| `age` | จำนวนชั่วโมงย้อนหลัง |
| `level` | flight level ที่ต้องการค้นหา บวกลบประมาณ 3,000 ฟุต |
| `inten` | intensity ขั้นต่ำ เช่น `lgt`, `mod`, `sev` |
| `date` | เวลาเฉพาะที่ต้องการค้นหา |

ตัวอย่าง:

```text
https://aviationweather.gov/api/data/pirep?id=VTBS&distance=250&format=json
https://aviationweather.gov/api/data/pirep?bbox=97,5,106,21&format=geojson
https://aviationweather.gov/api/data/pirep?bbox=-125,24,-66,50&format=geojson&inten=mod
```

คำแนะนำสำหรับ heat map:

ไม่ควรตีความว่า “ไม่มีรายงาน = ปลอดภัย” เพราะอาจแปลว่าไม่มีเครื่องบินรายงานในพื้นที่นั้น ควรแสดงเป็น report density หรือ observed hazard layer

### 4. G-AIRMET: Graphical AIRMET สำหรับ contiguous US

Endpoint:

```text
/api/data/gairmet
```

ใช้ทำอะไร:

G-AIRMET คือ advisory แบบกราฟิกสำหรับพื้นที่ 48 รัฐของสหรัฐฯ ใช้แสดง hazard เช่น IFR, turbulence, icing, freezing level, mountain obscuration, low-level wind shear และ strong surface wind ข้อมูลมักเป็น polygon จึงเหมาะกับ risk overlay มากกว่า heat point

เหมาะใช้แสดง:

- IFR risk polygon
- Icing risk polygon
- Turbulence risk polygon
- Freezing level layer
- Mountain obscuration layer
- LLWS layer
- Polygon overlap risk score

พารามิเตอร์สำคัญ:

| Parameter | ความหมาย |
|---|---|
| `product` | `sierra`, `tango`, `zulu` |
| `hazard` | hazard เช่น `ifr`, `mtn_obs`, `ice`, `turb-hi`, `turb-lo`, `llws`, `sfc_wind`, `fzlvl` |
| `format` | `raw`, `json`, `geojson`, `xml` |
| `date` | เวลาเฉพาะที่ต้องการค้นหา |
| `fore` | forecast hour เช่น `0`, `3`, `6`, `9`, `12` |

ตัวอย่าง:

```text
https://aviationweather.gov/api/data/gairmet?format=geojson
https://aviationweather.gov/api/data/gairmet?format=geojson&hazard=ice
https://aviationweather.gov/api/data/gairmet?format=geojson&product=tango&fore=6
```

คำแนะนำสำหรับ heat map:

เหมาะทำเป็น polygon overlay แล้วให้คะแนนความเสี่ยง เช่น IFR = 3, icing = 4, turbulence high = 5 หรือคำนวณพื้นที่ที่ polygon ซ้อนกันเป็น heat intensity

### 5. AIRMET: AIRMET สำหรับ Alaska

Endpoint:

```text
/api/data/airmet
```

ใช้ทำอะไร:

AIRMET endpoint นี้เป็น domestic AIRMET สำหรับ Alaska เท่านั้น ใช้คล้ายกับ G-AIRMET แต่พื้นที่ครอบคลุม Alaska

เหมาะใช้แสดง:

- IFR risk
- Turbulence risk
- Icing risk
- Convective risk
- Alaska aviation advisory overlay

พารามิเตอร์สำคัญ:

| Parameter | ความหมาย |
|---|---|
| `hazard` | `turb`, `ifr`, `conv`, `ice` |
| `level` | flight level ที่ต้องการค้นหา |
| `format` | `json`, `geojson`, `iwxxm` |
| `date` | เวลาเฉพาะที่ต้องการค้นหา |

ตัวอย่าง:

```text
https://aviationweather.gov/api/data/airmet?format=geojson
https://aviationweather.gov/api/data/airmet?format=geojson&hazard=ice
```

### 6. Domestic SIGMET: คำเตือนสภาพอากาศรุนแรงในสหรัฐฯ

Endpoint:

```text
/api/data/airsigmet
```

ใช้ทำอะไร:

Domestic SIGMET ใช้สำหรับคำเตือนสภาพอากาศการบินที่สำคัญใน contiguous United States เช่น convective weather, turbulence, icing และ IFR ไม่รวม international SIGMET

เหมาะใช้แสดง:

- Convective SIGMET polygon
- Severe turbulence polygon
- Severe icing polygon
- IFR hazard polygon
- High-risk weather overlay

พารามิเตอร์สำคัญ:

| Parameter | ความหมาย |
|---|---|
| `format` | `raw`, `json`, `geojson`, `xml`, `iwxxm` |
| `hazard` | `conv`, `turb`, `ice`, `ifr` |
| `level` | flight level ที่ต้องการค้นหา |

ตัวอย่าง:

```text
https://aviationweather.gov/api/data/airsigmet?format=geojson
https://aviationweather.gov/api/data/airsigmet?format=geojson&hazard=conv
```

คำแนะนำสำหรับ heat map:

เหมาะกับการทำ alert layer หรือ severity overlay มากกว่า interpolation heat map เพราะข้อมูลเป็นพื้นที่เตือนภัย

### 7. International SIGMET: คำเตือนระดับสากล

Endpoint:

```text
/api/data/isigmet
```

ใช้ทำอะไร:

International SIGMET คือ SIGMET ที่ออกในรูปแบบสากล ครอบคลุม FIR ต่าง ๆ ไม่รวม domestic SIGMET ของสหรัฐฯ

เหมาะใช้แสดง:

- International turbulence warning
- International icing warning
- FIR-level hazard polygon
- Global aviation hazard map

พารามิเตอร์สำคัญ:

| Parameter | ความหมาย |
|---|---|
| `format` | `raw`, `json`, `geojson`, `xml`, `iwxxm` |
| `hazard` | `turb`, `ice` |
| `level` | flight level ที่ต้องการค้นหา |
| `date` | เวลาเฉพาะที่ต้องการค้นหา |

ตัวอย่าง:

```text
https://aviationweather.gov/api/data/isigmet?format=geojson
https://aviationweather.gov/api/data/isigmet?format=geojson&hazard=turb
```

### 8. CWA: Center Weather Advisory

Endpoint:

```text
/api/data/cwa
```

ใช้ทำอะไร:

CWA คือ Center Weather Advisory จาก NWS Center Weather Service Units ใช้แจ้ง hazard ระยะสั้นที่กระทบการบิน เช่น thunderstorm, turbulence, icing, IFR และ precipitation

เหมาะใช้แสดง:

- Near-real-time aviation advisory
- Thunderstorm risk
- Turbulence/icing/IFR advisory polygon
- Operational weather alert layer

พารามิเตอร์สำคัญ:

| Parameter | ความหมาย |
|---|---|
| `hazard` | `ts`, `turb`, `ice`, `ifr`, `pcpn`, `unk` |
| `format` | `raw`, `json`, `geojson` |
| `date` | เวลาเฉพาะที่ต้องการค้นหา |

ตัวอย่าง:

```text
https://aviationweather.gov/api/data/cwa?format=geojson
https://aviationweather.gov/api/data/cwa?format=geojson&hazard=ts
```

คำแนะนำสำหรับ heat map:

ใช้เป็น alert polygon และให้ weight ตามชนิด hazard เช่น `ts` สูงกว่า `pcpn`

### 9. TCF: TFM Convective Forecast

Endpoint:

```text
/api/data/tcf
```

ใช้ทำอะไร:

TCF คือ Traffic Flow Management Convective Forecast ใช้แสดงพื้นที่คาดการณ์ convective weather ที่กระทบการจัดการจราจรทางอากาศ เช่น thunderstorm coverage, confidence และ echo tops

เหมาะใช้แสดง:

- Convective forecast polygon
- Thunderstorm risk map
- Echo top category map
- Traffic flow impact map

พารามิเตอร์สำคัญ:

| Parameter | ความหมาย |
|---|---|
| `format` | `raw`, `geojson` |

ตัวอย่าง:

```text
https://aviationweather.gov/api/data/tcf?format=geojson
```

คำแนะนำสำหรับ heat map:

ใน GeoJSON properties มีข้อมูลอย่าง `coverage`, `confidence`, `tops` สามารถแปลงเป็น intensity ได้ เช่น coverage medium + confidence high + tops สูง = risk สูง

### 10. Wind/Temp Point Data

Endpoint:

```text
/api/data/windtemp
```

ใช้ทำอะไร:

ดึงข้อมูลลมและอุณหภูมิจาก legacy FD winds เป็น text data เหมาะกับข้อมูลระดับความสูง เช่น winds aloft และ temperature aloft

เหมาะใช้แสดง:

- Wind speed aloft heat map
- Temperature aloft heat map
- Headwind/tailwind layer ตาม route
- Flight level wind planning

พารามิเตอร์สำคัญ:

| Parameter | ความหมาย |
|---|---|
| `region` | พื้นที่ เช่น `us`, `bos`, `mia`, `chi`, `dfw`, `slc`, `sfo`, `alaska`, `hawaii`, `other_pac` |
| `level` | `low` หรือ `high` |
| `fcst` | forecast cycle เช่น `06`, `12`, `24` |

ตัวอย่าง:

```text
https://aviationweather.gov/api/data/windtemp?region=us&level=low&fcst=06
```

คำแนะนำสำหรับ heat map:

endpoint นี้คืนค่าเป็น text จึงต้อง parse เพิ่มก่อนนำไปทำ heat map

## ข้อมูลประกอบแผนที่ที่ควรใช้ร่วมกัน

### Station Info

Endpoint:

```text
/api/data/stationinfo
```

ใช้ทำอะไร:

ดึงข้อมูลสถานีตรวจอากาศ เช่น ICAO, lat/lon, elevation, country และประเภทข้อมูลที่สถานีรองรับ ใช้เป็น reference สำหรับ plot จุดสถานี

ตัวอย่าง:

```text
https://aviationweather.gov/api/data/stationinfo?ids=VTBS&format=json
https://aviationweather.gov/api/data/stationinfo?bbox=97,5,106,21&format=geojson
```

### Airport Info

Endpoint:

```text
/api/data/airport
```

ใช้ทำอะไร:

ดึงข้อมูลสนามบิน เช่น ICAO, IATA, FAA ID, ชื่อสนามบิน, ประเทศ, lat/lon และ elevation ใช้ทำ airport layer หรือ airport lookup

ตัวอย่าง:

```text
https://aviationweather.gov/api/data/airport?ids=VTBS&format=json
```

### Navaid, Fix, Feature, Obstacle

Endpoints:

```text
/api/data/navaid
/api/data/fix
/api/data/feature
/api/data/obstacle
```

ใช้ทำอะไร:

กลุ่มนี้เป็นข้อมูล navigation และ reference บนแผนที่ ไม่ใช่ข้อมูลอากาศโดยตรง

- `/navaid`: ข้อมูล navigational aid เช่น VOR, NDB, TACAN
- `/fix`: ข้อมูล fix/waypoint
- `/feature`: geographic/aviation features เพิ่มเติม
- `/obstacle`: สิ่งกีดขวางทางการบิน

เหมาะใช้เป็น layer ประกอบ aviation map เช่น route, waypoint, obstacle awareness

## Endpoint ที่ไม่เหมาะกับ Heat Map โดยตรง แต่มีประโยชน์กับ Briefing

### Area Forecast

Endpoint:

```text
/api/data/areafcst
```

ใช้ทำอะไร:

ดึง Area Forecast แบบ text สำหรับพื้นที่นอก contiguous states โดยเฉพาะ Alaska เหมาะกับ briefing มากกว่าทำ heat map

ตัวอย่าง:

```text
https://aviationweather.gov/api/data/areafcst?region=akcentral
```

### Forecast Discussion

Endpoint:

```text
/api/data/fcstdisc
```

ใช้ทำอะไร:

ดึง Aviation Forecast Discussion จาก Weather Forecast Office ใช้ดูคำอธิบายเชิงพยากรณ์ เช่น aviation section หรือ full discussion ในช่วง 6 ชั่วโมงล่าสุด

ตัวอย่าง:

```text
https://aviationweather.gov/api/data/fcstdisc?cwa=keax&type=afd
```

### Meteorological Information Statement

Endpoint:

```text
/api/data/mis
```

ใช้ทำอะไร:

ดึง Meteorological Information Statement จาก CWSU เป็นข้อความสถานการณ์อากาศที่กระทบการบิน เหมาะกับ alert หรือ briefing

ตัวอย่าง:

```text
https://aviationweather.gov/api/data/mis?loc=zkc&format=json
```

### Dataserver Compatibility Layer

Endpoint:

```text
/api/data/dataserver
```

ใช้ทำอะไร:

เป็น compatibility layer สำหรับ Text Data Service เดิม เอกสารระบุว่า deprecated และควรย้ายไปใช้ endpoint เฉพาะ product เช่น `/metar`, `/taf`, `/pirep` แทน

## ตัวอย่าง Response API

ตัวอย่างด้านล่างเป็น response แบบย่อเพื่อให้เห็นโครงสร้างข้อมูลที่ต้อง parse จริง บาง field ถูกตัดออกเพื่อให้อ่านง่าย และค่าตัวอย่างไม่ควรถือเป็นข้อมูล realtime

### METAR JSON Response

Request:

```text
GET /api/data/metar?ids=KMCI&format=json
```

Response:

```json
[
  {
    "icaoId": "KMCI",
    "receiptTime": "2026-05-19T04:53:00.000Z",
    "obsTime": 1779166380,
    "reportTime": "2026-05-19T04:53:00.000Z",
    "temp": 22,
    "dewp": 17,
    "wdir": 180,
    "wspd": 12,
    "wgst": 20,
    "visib": "10+",
    "altim": 1012.8,
    "slp": 1012.4,
    "wxString": "-RA",
    "rawOb": "KMCI 190453Z 18012G20KT 10SM -RA BKN050 22/17 A2991",
    "lat": 39.2976,
    "lon": -94.7139,
    "elev": 312,
    "name": "KANSAS CITY INTL",
    "fltCat": "VFR",
    "clouds": [
      {
        "cover": "BKN",
        "base": 5000
      }
    ]
  }
]
```

Field ที่เหมาะกับ heat map:

- `temp`: อุณหภูมิ
- `dewp`: dew point
- `wspd`, `wgst`: ความเร็วลมและลมกระโชก
- `visib`: visibility
- `fltCat`: flight category
- `clouds[].base`: cloud ceiling
- `lat`, `lon`: พิกัดสำหรับ plot จุด

### METAR GeoJSON Response

Request:

```text
GET /api/data/metar?bbox=-95,38,-93,40&format=geojson
```

Response:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "icaoId": "KMCI",
        "obsTime": "2026-05-19T04:53:00.000Z",
        "temp": 22,
        "dewp": 17,
        "wdir": 180,
        "wspd": 12,
        "visib": "10+",
        "altim": 29.91,
        "slp": 1012.4,
        "fltCat": "VFR",
        "rawOb": "KMCI 190453Z 18012KT 10SM BKN050 22/17 A2991",
        "clouds": [
          {
            "cover": "BKN",
            "base": 5000
          }
        ]
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-94.7139, 39.2976]
      }
    }
  ]
}
```

ข้อสังเกต:

- GeoJSON ใช้พิกัดเรียงเป็น `[lon, lat]`
- ใช้กับ Mapbox, Leaflet, deck.gl ได้ง่ายกว่า JSON ปกติ

### TAF JSON Response

Request:

```text
GET /api/data/taf?ids=KMCI&format=json
```

Response:

```json
[
  {
    "icaoId": "KMCI",
    "receiptTime": "2026-05-19T05:20:00.000Z",
    "issueTime": "2026-05-19T05:20:00.000Z",
    "validTimeFrom": 1779168000,
    "validTimeTo": 1779254400,
    "rawTAF": "TAF KMCI 190520Z 1906/2006 18012KT P6SM BKN050 ...",
    "lat": 39.2976,
    "lon": -94.7139,
    "elev": 312,
    "name": "KANSAS CITY INTL",
    "fcsts": [
      {
        "timeFrom": 1779168000,
        "timeTo": 1779182400,
        "change": "FM",
        "wdir": 180,
        "wspd": 12,
        "wgst": 20,
        "visib": "6+",
        "wxString": "-RA",
        "clouds": [
          {
            "cover": "BKN",
            "base": 5000
          }
        ]
      }
    ]
  }
]
```

Field ที่เหมาะกับ forecast heat map:

- `fcsts[].timeFrom`, `fcsts[].timeTo`: ช่วงเวลาพยากรณ์
- `fcsts[].wspd`, `fcsts[].wgst`: forecast wind
- `fcsts[].visib`: forecast visibility
- `fcsts[].clouds[].base`: forecast ceiling
- `fcsts[].wxString`: weather condition

### PIREP GeoJSON Response

Request:

```text
GET /api/data/pirep?bbox=-125,24,-66,50&format=geojson&age=2
```

Response:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "receiptTime": "2026-05-19T04:35:00.000Z",
        "obsTime": 1779165300,
        "aircraftRef": "B738",
        "fltLvl": 340,
        "reportType": "PIREP",
        "rawOb": "UA /OV ABC/TM 0435/FL340/TP B738/TB MOD/RM DURC",
        "turbulence": [
          {
            "inten": "MOD",
            "type": "CAT",
            "base": 32000,
            "top": 36000
          }
        ],
        "icing": [],
        "clouds": []
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-97.25, 35.45]
      }
    }
  ]
}
```

Field ที่เหมาะกับ heat map:

- `fltLvl`: flight level
- `turbulence[].inten`: turbulence intensity
- `icing[].inten`: icing intensity
- `geometry.coordinates`: จุดรายงาน
- `receiptTime`, `obsTime`: ใช้กรองอายุข้อมูล

### G-AIRMET GeoJSON Response

Request:

```text
GET /api/data/gairmet?format=geojson&hazard=ice&fore=3
```

Response:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "tag": "3Z",
        "forecastHour": 3,
        "receiptTime": "2026-05-19T03:00:00.000Z",
        "issueTime": "2026-05-19T02:45:00.000Z",
        "validTime": "2026-05-19T06:00:00.000Z",
        "hazard": "ICE",
        "due_to": "MOD ICE BTN FRZLVL AND FL180",
        "product": "ZULU"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-103.5, 39.2],
            [-101.0, 39.5],
            [-100.5, 37.9],
            [-103.2, 37.5],
            [-103.5, 39.2]
          ]
        ]
      }
    }
  ]
}
```

Field ที่เหมาะกับ risk map:

- `hazard`: ประเภท hazard
- `forecastHour`: ชั่วโมงพยากรณ์
- `validTime`: เวลาที่ forecast มีผล
- `due_to`: เหตุผลของ advisory
- `geometry`: polygon สำหรับ overlay

### Domestic SIGMET GeoJSON Response

Request:

```text
GET /api/data/airsigmet?format=geojson&hazard=conv
```

Response:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "icaoId": "KKCI",
        "alphaChar": "W",
        "seriesId": "NOVEMBER 7",
        "validTimeFrom": "2026-05-19T04:55:00.000Z",
        "validTimeTo": "2026-05-19T06:55:00.000Z",
        "airSigmetType": "SIGMET",
        "hazard": "CONVECTIVE",
        "altitudeHi1": 35000,
        "altitudeLo1": null,
        "movementDir": 90,
        "movementSpd": 10,
        "severity": 5,
        "rawAirSigmet": "CONVECTIVE SIGMET 24W VALID UNTIL 0655Z ..."
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-114.5, 34.0],
            [-112.0, 35.0],
            [-111.0, 33.5],
            [-113.5, 32.9],
            [-114.5, 34.0]
          ]
        ]
      }
    }
  ]
}
```

Field ที่เหมาะกับ heat/risk map:

- `hazard`: ประเภท SIGMET
- `severity`: ความรุนแรง ถ้ามี
- `altitudeHi1`, `altitudeLo1`: ระดับความสูง
- `movementDir`, `movementSpd`: ทิศทางและความเร็วการเคลื่อนที่
- `geometry`: polygon พื้นที่เตือนภัย

### International SIGMET GeoJSON Response

Request:

```text
GET /api/data/isigmet?format=geojson&hazard=turb
```

Response:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "icaoId": "PAWU",
        "firId": "PAZA",
        "firName": "ANCHORAGE",
        "validTimeFrom": 1779163200,
        "validTimeTo": 1779177600,
        "seriesId": "LIMA 2",
        "hazard": "TURB",
        "qualifier": "OCNL",
        "base": 37000,
        "top": 42000,
        "dir": "E",
        "spd": 20,
        "chng": "NC"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-150.0, 60.0],
            [-145.0, 60.5],
            [-144.5, 58.0],
            [-149.5, 57.8],
            [-150.0, 60.0]
          ]
        ]
      }
    }
  ]
}
```

Field ที่เหมาะกับ global hazard map:

- `firId`, `firName`: FIR ที่เกี่ยวข้อง
- `hazard`: hazard type
- `base`, `top`: ชั้นความสูง
- `dir`, `spd`, `chng`: การเคลื่อนที่/แนวโน้ม

### CWA GeoJSON Response

Request:

```text
GET /api/data/cwa?format=geojson&hazard=ts
```

Response:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "cwsu": "ZJX",
        "name": "Jacksonville",
        "validTimeFrom": 1779163200,
        "validTimeTo": 1779170400,
        "hazard": "TS",
        "seriesId": 101,
        "qualifier": "AREA",
        "base": null,
        "top": 45000,
        "cwaText": "ZJX CWA 101 VALID UNTIL 0600Z AREA TS MOV E ..."
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-83.0, 31.0],
            [-80.5, 31.5],
            [-80.2, 29.8],
            [-82.8, 29.4],
            [-83.0, 31.0]
          ]
        ]
      }
    }
  ]
}
```

Field ที่เหมาะกับ operational alert map:

- `hazard`: เช่น `TS`, `TURB`, `ICE`, `IFR`, `PCPN`
- `validTimeFrom`, `validTimeTo`: เวลาที่ advisory มีผล
- `top`, `base`: ระดับความสูงของ hazard
- `geometry`: polygon

### TCF GeoJSON Response

Request:

```text
GET /api/data/tcf?format=geojson
```

Response:

```json
{
  "type": "FeatureCollection",
  "issueTime": "20260519_0300",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "validTime": "20260519_1100",
        "issueTime": "20260519_0300",
        "coverage": "medium",
        "confidence": "high",
        "tops": 390,
        "labelpos": [-87.9316, 41.9602]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-90.0, 42.0],
            [-86.0, 42.5],
            [-85.5, 40.5],
            [-89.5, 40.0],
            [-90.0, 42.0]
          ]
        ]
      }
    }
  ]
}
```

Field ที่เหมาะกับ convective heat/risk map:

- `coverage`: ความครอบคลุมของ convective area
- `confidence`: ความเชื่อมั่นของ forecast
- `tops`: echo top category
- `validTime`: เวลาที่ forecast มีผล
- `geometry`: polygon

### Station Info JSON Response

Request:

```text
GET /api/data/stationinfo?ids=KMCI&format=json
```

Response:

```json
[
  {
    "icaoId": "KMCI",
    "iataId": "MCI",
    "faaId": "MCI",
    "name": "KANSAS CITY INTL",
    "lat": 39.2976,
    "lon": -94.7139,
    "elev": 312,
    "state": "MO",
    "country": "US",
    "priority": 0,
    "site": "METAR,TAF"
  }
]
```

ใช้ทำอะไร:

- ใช้สร้าง master data ของสถานี
- ใช้เติมชื่อสนามบิน พิกัด และ elevation ให้ layer อากาศ
- ใช้ตรวจว่าสถานีมี METAR/TAF หรือไม่

### Airport JSON Response

Request:

```text
GET /api/data/airport?ids=KMCI&format=json
```

Response:

```json
[
  {
    "icaoId": "KMCI",
    "iataId": "MCI",
    "faaId": "MCI",
    "name": "KANSAS CITY/KANSAS CITY INTL",
    "state": "MO",
    "country": "US",
    "source": "FAA",
    "type": "ARP",
    "lat": 39.2976,
    "lon": -94.7139,
    "elev": 312
  }
]
```

ใช้ทำอะไร:

- ใช้เป็น airport lookup
- ใช้แสดง airport marker
- ใช้ join กับ METAR/TAF ผ่าน `icaoId`

### Wind/Temp Text Response

Request:

```text
GET /api/data/windtemp?region=us&level=low&fcst=06
```

Response:

```text
DATA BASED ON 190000Z
VALID 190600Z FOR USE 0500-0900Z
FT  3000  6000  9000 12000 18000 24000
ABI 1812 1918+12 2024+08 2130+04 2240-08 2350-18
AMA 2015 2120+10 2225+06 2335+02 2445-10 2555-20
DEN 2408 2515+04 2622+00 2730-04 2840-16 2950-26
```

ข้อสังเกต:

- endpoint นี้คืนเป็น text ไม่ใช่ JSON
- ต้อง parse รหัสสถานี ระดับความสูง ทิศลม ความเร็วลม และอุณหภูมิเอง
- เหมาะทำ wind/temp aloft layer หลังผ่าน parser แล้ว

## วิธีการใช้งาน API

### 1. เลือก endpoint ตามชนิดข้อมูล

ตัวอย่างการเลือก:

| ต้องการข้อมูล | Endpoint ที่ควรใช้ |
|---|---|
| อากาศจริงตอนนี้รายสนามบิน | `/metar` |
| พยากรณ์รายสนามบิน | `/taf` |
| turbulence/icing จากนักบิน | `/pirep` |
| พื้นที่ advisory ของ IFR/icing/turbulence | `/gairmet`, `/airmet`, `/airsigmet`, `/isigmet`, `/cwa` |
| พายุ/convective forecast | `/tcf` |
| ข้อมูลสถานี/สนามบิน | `/stationinfo`, `/airport` |

### 2. เลือกขอบเขตข้อมูล

เลือกได้หลายแบบขึ้นกับ endpoint:

```text
ids=VTBS
bbox=97,5,106,21
id=VTBS&distance=250
```

ความหมาย:

- `ids`: ดึงตามรหัสสนามบิน/สถานี
- `bbox`: ดึงตามกรอบพิกัด ใช้กับแผนที่หรือ heat map
- `id` + `distance`: ดึงรอบสนามบินเป็นรัศมี ใช้กับ PIREP

หมายเหตุ: เอกสารระบุว่า endpoint หลายเส้นต้องมี station identifiers หรือ bounding box เพื่อจำกัดขอบเขตการค้นหา

### 3. เลือก format ให้เหมาะกับงาน

| Format | เหมาะกับ |
|---|---|
| `json` | ใช้กับ backend/app ทั่วไป parse ง่าย |
| `geojson` | เหมาะกับแผนที่ Mapbox, Leaflet, deck.gl, QGIS |
| `raw` | ข้อความ aviation weather ดิบ |
| `decoded` | ข้อความที่อ่านง่ายขึ้น |
| `xml` | ระบบ legacy หรือ integration เดิม |
| `iwxxm` | ระบบ aviation weather ที่ใช้มาตรฐาน IWXXM |

คำแนะนำ:

- Heat map หรือ map overlay ควรใช้ `geojson`
- ถ้าต้องคำนวณเองและต้องการ field ชัด ๆ ใช้ `json`
- ถ้า endpoint คืน text เช่น `/windtemp` ต้อง parse ก่อน

### 4. ตัวอย่างเรียก API ด้วย curl

```bash
curl "https://aviationweather.gov/api/data/metar?ids=VTBS&format=json"
```

```bash
curl "https://aviationweather.gov/api/data/metar?bbox=97,5,106,21&format=geojson"
```

```bash
curl "https://aviationweather.gov/api/data/gairmet?format=geojson&hazard=ice"
```

```bash
curl "https://aviationweather.gov/api/data/pirep?id=VTBS&distance=250&format=json"
```

### 5. ตัวอย่างใช้งานด้วย JavaScript

```javascript
async function getMetarHeatmapPoints() {
  const url = "https://aviationweather.gov/api/data/metar?bbox=97,5,106,21&format=json";
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`AviationWeather API error: ${response.status}`);
  }

  const rows = await response.json();

  return rows
    .filter((row) => row.lat != null && row.lon != null && row.temp != null)
    .map((row) => ({
      lat: row.lat,
      lon: row.lon,
      value: row.temp,
      station: row.icaoId,
      label: row.name,
    }));
}
```

### 6. ตัวอย่างแปลง Flight Category เป็น Heat Score

```javascript
function flightCategoryScore(fltCat) {
  switch (fltCat) {
    case "VFR":
      return 1;
    case "MVFR":
      return 2;
    case "IFR":
      return 3;
    case "LIFR":
      return 4;
    default:
      return 0;
  }
}
```

ใช้กับ METAR:

```javascript
const points = metars
  .filter((row) => row.lat != null && row.lon != null)
  .map((row) => ({
    lat: row.lat,
    lon: row.lon,
    value: flightCategoryScore(row.fltCat),
  }));
```

### 7. ตัวอย่างแปลง Hazard Polygon เป็น Risk Score

```javascript
function hazardScore(hazard) {
  const key = String(hazard || "").toLowerCase();

  if (key.includes("conv") || key.includes("ts")) return 5;
  if (key.includes("ice")) return 4;
  if (key.includes("turb")) return 4;
  if (key.includes("ifr")) return 3;
  if (key.includes("pcpn")) return 2;

  return 1;
}
```

ใช้กับ GeoJSON:

```javascript
const scoredFeatures = geojson.features.map((feature) => ({
  ...feature,
  properties: {
    ...feature.properties,
    riskScore: hazardScore(feature.properties.hazard),
  },
}));
```

### 8. ข้อจำกัดและข้อควรระวัง

- เอกสารระบุว่าสามารถเข้าถึงข้อมูลย้อนหลังได้ถึงประมาณ 15 วัน
- API มี rate limit ประมาณ 100 requests/minute
- เอกสารแนะนำไม่ควรเรียก endpoint เดิมถี่กว่า 1 request/minute ต่อ thread
- หลาย endpoint คืนผลลัพธ์สูงสุดประมาณ 400 records
- ถ้าต้องดึงข้อมูลชุดใหญ่หรือถี่ ควรใช้ cache files แทน
- Cross-Origin Resource Sharing หรือ CORS ยังไม่เปิด จึงควรเรียกผ่าน backend/proxy ของระบบคุณเอง
- ควรกำหนด custom User-Agent ในฝั่ง backend เพื่อป้องกันถูก automated filtering block
- ถ้า response เป็น `204 No Content` แปลว่า request ถูกต้องแต่ไม่มีข้อมูล
- ถ้าได้ `429 Too Many Requests` แปลว่าเรียกถี่เกิน rate limit

### 9. Cache Files สำหรับข้อมูลชุดใหญ่

ถ้าต้องใช้ข้อมูล current dataset จำนวนมาก ควรใช้ cache files ตามที่ docs แนะนำ เช่น:

```text
https://aviationweather.gov/data/cache/metars.cache.xml.gz
https://aviationweather.gov/data/cache/metars.cache.csv.gz
https://aviationweather.gov/data/cache/tafs.cache.xml.gz
https://aviationweather.gov/data/cache/airsigmets.cache.xml.gz
https://aviationweather.gov/data/cache/gairmets.cache.xml.gz
https://aviationweather.gov/data/cache/aircraftreports.cache.xml.gz
https://aviationweather.gov/data/cache/stations.cache.json.gz
```

เหมาะกับ:

- ดึง current METAR ทั้งหมด
- ดึง TAF ทั้งหมด
- ดึง G-AIRMET/SIGMET/PIREP current dataset
- ลดจำนวน request ซ้ำ ๆ ไปยัง API

## Recommendation สำหรับทำ Heat Map จริง

เริ่มจาก 3 layer หลัก:

1. Current Weather Layer จาก `/metar`
   - temperature
   - wind speed
   - visibility
   - ceiling
   - flight category

2. Observed Hazard Layer จาก `/pirep`
   - turbulence
   - icing
   - report density
   - severity

3. Forecast/Advisory Layer จาก `/gairmet`, `/cwa`, `/tcf`, `/airsigmet`
   - IFR polygon
   - icing polygon
   - turbulence polygon
   - thunderstorm/convective polygon
   - polygon overlap risk score

สำหรับประเทศไทยหรือภูมิภาคนอกสหรัฐฯ:

- ใช้ `/metar` และ `/taf` ได้ทั่วโลกถ้ามีสถานีในระบบ
- ใช้ `/pirep` ได้ แต่ coverage หลักอยู่ที่สหรัฐฯ และ North Atlantic
- G-AIRMET, AIRMET, CWA, TCF หลายตัวเน้นสหรัฐฯ จึงอาจไม่เหมาะกับไทยโดยตรง
- สำหรับ global aviation hazard ให้ดู `/isigmet` เพิ่ม
