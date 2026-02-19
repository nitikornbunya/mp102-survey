/**
 * Base URL ของ Backend API (โปรเจกต์นี้เป็น frontend-only เรียก backend แยก)
 * ตั้งค่าใน NEXT_PUBLIC_API_URL เช่น https://your-backend.vercel.app
 * เว้นว่าง = ใช้ same origin (เหมาะกับ proxy ใน dev)
 */
const API_BASE = typeof process.env.NEXT_PUBLIC_API_URL === "string" ? process.env.NEXT_PUBLIC_API_URL.trim() : "";

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
}
