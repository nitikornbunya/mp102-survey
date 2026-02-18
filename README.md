This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

1. **Push โปรเจกต์ไปที่ Git** (GitHub / GitLab / Bitbucket) แล้วเชื่อมกับ [Vercel](https://vercel.com/new).

2. **ตั้งค่า Environment Variables** ใน Vercel Dashboard (Settings → Environment Variables):
   - `NEXT_PUBLIC_LIFF_ID` — LIFF ID จาก LINE Developers Console (สร้าง LIFF แล้วใส่ Endpoint URL เป็น `https://your-app.vercel.app`)

3. **เก็บข้อมูลแบบถาวร (แนะนำ)**  
   บน Vercel ระบบไฟล์ไม่ persist จึงต้องใช้ Vercel KV:
   - ใน Vercel Dashboard ไปที่ **Storage** → **Create Database** → เลือก **KV**
   - หลังสร้างแล้วกด **Connect to Project** เลือกโปรเจกต์นี้  
   - Vercel จะใส่ `KV_REST_API_URL` และ `KV_REST_API_TOKEN` ให้อัตโนมัติ

4. **Deploy** — กด Deploy โปรเจกต์ หลัง deploy เสร็จให้ไปอัปเดต LIFF Endpoint URL ใน LINE Developers Console เป็น URL ของ Vercel จริง (เช่น `https://xxx.vercel.app`)

**หมายเหตุ:** รัน local ไม่ต้องตั้งค่า KV จะใช้ไฟล์ในโฟลเดอร์ `data/` แทน
