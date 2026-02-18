import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — ระบบรับฟังความคิดเห็น",
  description: "หน้าสำหรับผู้ดูแลระบบดูผลลัพธ์คำตอบ",
};

export default function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  return <>{children}</>;
}
