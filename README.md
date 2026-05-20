# Weather Map POC

React + TypeScript POC สำหรับแสดงข้อมูล METAR จาก AviationWeather บน Google Maps

ทิศทาง requirement ปัจจุบันคือ **station-based operational weather map**:

- แสดงสภาพอากาศที่ตำแหน่งจริงของแต่ละ METAR station
- ใช้ marker/icon/badge แทนการ spread เป็นพื้นที่
- โหมดหลัก: Rain, Wind, Thunderstorm, Temperature
- Cloud ใช้เก็บข้อมูลไว้สำหรับ detail/future phase

หมายเหตุ: โค้ด runtime ปัจจุบันยังมี legacy heatmap flow อยู่ระหว่าง migration ไป station marker ตาม [Tasks.md](Readme/Tasks.md)

## Setup

ติดตั้ง dependencies:

```bash
npm install
```

สร้างไฟล์ `.env` ที่ root project:

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

รัน development server:

```bash
npm run dev
```

เปิด URL ที่ Vite แสดงใน terminal โดยปกติจะเป็น:

```txt
http://127.0.0.1:5173/
```

## Scripts

ตรวจ lint:

```bash
npm run lint
```

build production bundle:

```bash
npm run build
```

preview production build:

```bash
npm run preview
```

## Notes

- ต้องมี Google Maps JavaScript API key ใน `.env`
- METAR เป็น station observation ไม่ใช่ radar หรือ gridded weather coverage
- Radar-like / global smooth visualization ต้องใช้ raster/tile/radar provider แยกจาก METAR
- ห้าม commit `.env` หรือ API key ลง repository
- เอกสาร implementation รายละเอียดอยู่ที่ [Readme/implementation-guide.md](Readme/implementation-guide.md)
- Requirement ปัจจุบันอยู่ที่ [Readme/Tasks.md](Readme/Tasks.md)
