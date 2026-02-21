"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppHeader from "@/app/components/AppHeader";
import LineLoginGate from "@/app/components/LineLoginGate";
import Phase1Form from "@/app/components/Phase1Form";

const BASE_LINKS = [
  { href: "/base1", label: "ชุดคำถาม A", sub: "" },
  { href: "/base2", label: "ชุดคำถาม B", sub: "" },
  { href: "/base3", label: "ชุดคำถาม C", sub: "" },
  { href: "/base4", label: "ชุดคำถาม D", sub: "" },
] as const;

function MainContent() {
  const searchParams = useSearchParams();
  const editProfile = searchParams.get("editProfile") === "1";

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <AppHeader />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <p className="mb-8 text-center text-zinc-600">
          กรุณาตอบคำถามตามช่วงที่กำหนด สามารถย้อนกลับแก้ไขก่อนกดส่งได้ <br />
          หมายเหตุ: ข้อมูลที่ท่านส่งเข้ามาจะถูกประมวลผลแบบไม่ระบุตัวตน และรายงานผลในภาพรวมโดยไม่เปิดเผยข้อมูลส่วนบุคคลของผู้ตอบแบบสอบถาม
        </p>

        <LineLoginGate editProfile={editProfile}>
          <Phase1Form />

          {/* ลิงก์ไปชุดคำถามแต่ละฐาน (สำหรับสแกน QR หรือเข้าโดยตรง) */}
          <div className="mt-10">
            <h2 className="font-sarabun mb-4 text-lg font-semibold text-zinc-800">
              ช่วงคำถามที่ 2 (ตาม 4 ฐาน)
            </h2>
            <p className="mb-6 text-sm text-zinc-600">
              เลือกชุดคำถามที่ต้องการตอบ หรือสแกน QR Code ที่แต่ละฐาน
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {BASE_LINKS.map(({ href, label, sub }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col rounded-2xl border border-[#e7e5e2] bg-white p-5 shadow-md shadow-zinc-200/30 transition hover:border-[#ff6a13]/50 hover:shadow-lg"
                >
                  <span className="font-sarabun text-lg font-semibold text-zinc-800">{label}</span>
                  <span className="mt-0.5 text-sm text-zinc-500">{sub}</span>
                  <span className="mt-2 text-sm font-medium text-[#ff6a13]">ไปตอบคำถาม →</span>
                </Link>
              ))}
            </div>
          </div>
        </LineLoginGate>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#ff6a13] border-t-transparent" />
          <p className="text-zinc-500">กำลังโหลด...</p>
        </div>
      }
    >
      <MainContent />
    </Suspense>
  );
}
