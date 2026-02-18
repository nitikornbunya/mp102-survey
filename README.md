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

## Deploy บน Cloudflare Pages

โปรเจกต์ใช้ [OpenNext for Cloudflare](https://opennext.js.org/cloudflare) เพื่อ build Next.js ให้รันบน Cloudflare Workers/Pages

### 1. ติดตั้ง dependencies

```bash
npm install
```

(ต้องใช้ Node.js 20.9.0 ขึ้นไป)

### 2. ตั้งค่า Environment Variables

บน **Cloudflare Dashboard** → โปรเจกต์ → **Settings** → **Variables and Secrets**:

| ตัวแปร | ความหมาย |
|--------|----------|
| `NEXT_PUBLIC_LIFF_ID` | LIFF ID จาก LINE Developers Console |
| `UPSTASH_REDIS_REST_URL` | URL ของ Upstash Redis (ต้องมีบน Cloudflare เพราะไม่มีระบบไฟล์) |
| `UPSTASH_REDIS_REST_TOKEN` | Token ของ Upstash Redis |

สร้าง Redis ที่ [Upstash Console](https://console.upstash.com/) แล้ว copy ค่ามาใส่

### 3. Deploy

**แบบเชื่อม Git (แนะนำ)**

- ใน [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Connect to Git**
- เลือก repo แล้วตั้งค่า:
  - **Build command:** `npx opennextjs-cloudflare build` (จะรัน `next build` ให้อัตโนมัติ)
  - **Root directory:** เว้นว่าง
  - ใส่ Environment Variables ตามข้อ 2

หรือใช้ [คำแนะนำจาก OpenNext Cloudflare](https://opennext.js.org/cloudflare/get-started) สำหรับการตั้งค่าเพิ่มเติม

**แบบ deploy จากเครื่อง**

```bash
npm run deploy
```

(ต้อง login ด้วย `npx wrangler login` ก่อน)

### 4. หลัง deploy

ไปที่ LINE Developers Console → LIFF → แก้ Endpoint URL เป็น URL ของ Cloudflare (เช่น `https://mp-pple-workshop.pages.dev` หรือโดเมนที่ตั้งไว้)

**หมายเหตุ:** รัน local (`npm run dev`) ใช้ไฟล์ในโฟลเดอร์ `data/` ได้ ไม่ต้องตั้ง Redis
