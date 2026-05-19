# Weather Map POC

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
- ห้าม commit `.env` หรือ API key ลง repository
- เอกสาร implementation รายละเอียดอยู่ที่ [Readme/implementation-guide.md](Readme/implementation-guide.md)
