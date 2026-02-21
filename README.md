# ระบบรับฟังความคิดเห็น MP102 (Frontend)

โปรเจกต์นี้เป็น **frontend เท่านั้น** ใช้ Next.js (App Router)  
Backend (API สำหรับ feedback และ registration) แยกอยู่ที่โปรเจกต์อื่น

## Getting Started

```bash
npm install
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## Environment Variables

| ตัวแปร | ความหมาย |
|--------|----------|
| `NEXT_PUBLIC_LIFF_ID` | LIFF ID จาก LINE Developers Console — โปรเจกต์นี้ใช้ **LINE LIFF login เท่านั้น** (ไม่มี login แบบอื่น) |
| `NEXT_PUBLIC_API_URL` | URL ของ Backend API เช่น `https://your-backend.vercel.app` เว้นว่าง = ใช้ same origin |

คัดลอก `.env.local.example` เป็น `.env.local` แล้วใส่ค่าตามด้านบน

## โครงสร้าง

- **หน้าแบบสอบถาม (/)** — ลงทะเบียน, ตอบช่วงที่ 1 และช่วงที่ 2 (เรียก Backend API)
- **Dashboard (/dashboard)** — ดูผลรวมคำตอบ (เรียก Backend API เช่นกัน)

Frontend เรียก Backend ผ่าน `NEXT_PUBLIC_API_URL` + path เช่น  
`/api/feedback`, `/api/registration` (GET/POST/PATCH ตามที่ Backend รองรับ)

## Deploy Frontend

Deploy ไปที่ใดก็ได้ (Vercel, Netlify, Cloudflare Pages ฯลฯ) โดย:

1. ตั้งค่า **Build command:** `npm run build`
2. ตั้งค่า **Environment Variables:** `NEXT_PUBLIC_LIFF_ID` และ `NEXT_PUBLIC_API_URL` (ชี้ไปที่ Backend จริง)
3. หลัง deploy แล้วไปที่ LINE Developers Console → LIFF → ใส่ Endpoint URL เป็น URL ของ frontend นี้

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [LINE LIFF](https://developers.line.biz/en/docs/liff/)
