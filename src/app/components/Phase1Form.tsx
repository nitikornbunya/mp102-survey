"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Phase 1 ถูกลบออกแล้ว — redirect ไปหน้าหลักซึ่งใช้ FeedbackForm แบบ 6 ฐาน
 */
export default function Phase1Form() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-4 py-12">
      <p className="text-zinc-500">กำลังเปลี่ยนหน้า...</p>
    </div>
  );
}
