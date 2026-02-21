import { redirect } from "next/navigation";

// ให้รันบน Edge Runtime ตามที่ Cloudflare ต้องการ
export const runtime = "edge";

export default function Home() {
  redirect("/main");
}
