"use client";

import { useState, useEffect } from "react";
import { useLineLiff } from "@/app/context/LineLiffContext";
import RegistrationForm from "./RegistrationForm";

type Props = { children: React.ReactNode; editProfile?: boolean };

export default function LineLoginGate({ children, editProfile = false }: Props) {
  const { isReady, isLoggedIn, profile, error, login, logout } = useLineLiff();
  const [hasCompletedRegistration, setHasCompletedRegistration] = useState(false);
  const [loadingRegistration, setLoadingRegistration] = useState(true);
  const [registrationChecked, setRegistrationChecked] = useState(false);

  useEffect(() => {
    if (!profile?.userId) {
      setLoadingRegistration(false);
      setRegistrationChecked(!!profile);
      return;
    }
    setLoadingRegistration(true);
    fetch(`/api/registration?lineUserId=${encodeURIComponent(profile.userId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setHasCompletedRegistration(!!data);
        setRegistrationChecked(true);
      })
      .catch(() => setRegistrationChecked(true))
      .finally(() => setLoadingRegistration(false));
  }, [profile?.userId, profile]);

  if (!isReady) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#ff6a13] border-t-transparent" />
        <p className="text-zinc-500">กำลังโหลด...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-amber-200 bg-amber-50/80 p-6 text-center shadow-sm">
        <p className="font-medium text-amber-800">{error}</p>
        <p className="mt-2 text-sm text-amber-700">
          กรุณาตั้งค่า NEXT_PUBLIC_LIFF_ID ใน .env.local
        </p>
      </div>
    );
  }

  if (!isLoggedIn || !profile) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-[#e7e5e2] bg-white p-8 shadow-lg shadow-zinc-200/50">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#06C755]/10">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-[#06C755]" fill="currentColor" aria-hidden>
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-zinc-800">เข้าสู่ระบบด้วย LINE</h2>
          <p className="mt-2 text-zinc-600">
            กรุณาเข้าสู่ระบบเพื่อบันทึกและแก้ไขความคิดเห็นของคุณได้ภายหลัง
          </p>
        </div>
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={login}
            className="flex items-center gap-3 rounded-xl bg-[#06C755] px-8 py-3.5 font-medium text-white shadow-lg shadow-[#06C755]/25 transition hover:bg-[#05b34a] hover:shadow-[#06C755]/30 active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
            เข้าสู่ระบบด้วย LINE
          </button>
        </div>
      </div>
    );
  }

  // Login แล้ว แต่ยังไม่ลงทะเบียน หรือกดแก้ไขโปรไฟล์
  if (registrationChecked && !loadingRegistration && (!hasCompletedRegistration || editProfile)) {
    return (
      <div className="space-y-6">
        <RegistrationForm profile={profile} onSuccess={() => setHasCompletedRegistration(true)} />
      </div>
    );
  }

  // กำลังตรวจสอบการลงทะเบียน
  if (isLoggedIn && profile && loadingRegistration) {
    return (
      <div className="flex min-h-[30vh] flex-col items-center justify-center gap-4 py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#ff6a13] border-t-transparent" />
        <p className="text-zinc-500">กำลังตรวจสอบข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {children}
    </div>
  );
}
