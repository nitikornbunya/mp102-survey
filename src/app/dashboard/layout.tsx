import { cookies } from "next/headers";
import type { Metadata } from "next";
import DashboardPasswordGate from "@/app/components/DashboardPasswordGate";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Dashboard — ระบบรับฟังความคิดเห็น",
  description: "หน้าสำหรับผู้ดูแลระบบดูผลลัพธ์คำตอบ",
};

const DASHBOARD_COOKIE = "dashboard_access";

export default async function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const hasAccess = cookieStore.get(DASHBOARD_COOKIE)?.value === "1";

  if (!hasAccess) {
    return <DashboardPasswordGate />;
  }

  return <>{children}</>;
}
