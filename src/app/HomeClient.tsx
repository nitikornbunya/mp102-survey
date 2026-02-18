"use client";

import { useState, useRef, useEffect } from "react";
import FeedbackForm from "./components/FeedbackForm";
import LineLoginGate from "./components/LineLoginGate";
import { useLineLiff } from "@/app/context/LineLiffContext";
import { useRouter } from "next/navigation";

type Props = { editProfile?: boolean };

export default function HomeClient({ editProfile = false }: Props) {
  const { isLoggedIn, profile, logout } = useLineLiff();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [menuOpen]);

  const handleEditProfile = () => {
    setMenuOpen(false);
    router.push("/?editProfile=1");
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* แถบหัวสีส้ม */}
      <header className="bg-[#ff6a13] px-4 py-4 text-white shadow-md sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            ระบบรับฟังความคิดเห็น MP102
          </h1>
          {isLoggedIn && profile && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-white/20"
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                {profile.pictureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.pictureUrl}
                    alt=""
                    className="h-8 w-8 rounded-full border border-white/60 object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-white/20 text-xs font-semibold uppercase shadow-sm">
                    {profile.displayName?.[0] ?? "?"}
                  </div>
                )}
                <span className="sr-only">เมนู</span>
                <svg
                  className={`h-5 w-5 shrink-0 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 top-full z-50 mt-1.5 min-w-[180px] rounded-xl border border-white/20 bg-white py-1.5 shadow-lg"
                  role="menu"
                >
                  <div className="border-b border-zinc-100 px-4 py-2">
                    <p className="truncate text-sm font-medium text-zinc-800">{profile.displayName}</p>
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => router.push("/")}
                    className="flex w-full px-4 py-2.5 text-left text-sm text-zinc-700 transition hover:bg-zinc-100"
                  >
                    ทำแบบสอบถาม
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleEditProfile}
                    className="flex w-full px-4 py-2.5 text-left text-sm text-zinc-700 transition hover:bg-zinc-100"
                  >
                    แก้ไขโปรไฟล์
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full px-4 py-2.5 text-left text-sm text-zinc-700 transition hover:bg-zinc-100"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <p className="mb-8 text-center text-zinc-600">
          กรุณาตอบคำถามตามช่วงที่กำหนด สามารถย้อนกลับแก้ไขก่อนกดส่งได้ <br />
          หมายเหตุ: ข้อมูลที่ท่านส่งเข้ามาจะถูกประมวลผลแบบไม่ระบุตัวตน และรายงานผลในภาพรวมโดยไม่เปิดเผยข้อมูลส่วนบุคคลของผู้ตอบแบบสอบถาม
        </p>
        <LineLoginGate editProfile={editProfile}>
          <FeedbackForm />
        </LineLoginGate>
      </main>
    </div>
  );
}
