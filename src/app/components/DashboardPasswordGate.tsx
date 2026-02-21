"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPasswordGate() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/dashboard-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "รหัสผ่านไม่ถูกต้อง");
        return;
      }
      router.refresh();
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf9f7] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#e7e5e2] bg-white p-6 shadow-lg shadow-zinc-200/40">
        <h1 className="text-center text-xl font-bold text-zinc-800">Dashboard</h1>
        <p className="mt-1 text-center text-sm text-zinc-500">กรอกรหัสผ่านเพื่อเข้าดูข้อมูล</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="dashboard-password" className="sr-only">
              รหัสผ่าน
            </label>
            <input
              id="dashboard-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="รหัสผ่าน"
              autoFocus
              disabled={submitting}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-800 placeholder:text-zinc-400 focus:border-[#ff6a13] focus:outline-none focus:ring-2 focus:ring-[#ff6a13]/20 disabled:opacity-60"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting || !password.trim()}
            className="w-full rounded-xl bg-[#ff6a13] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#e55f0f] disabled:opacity-60"
          >
            {submitting ? "กำลังตรวจสอบ..." : "เข้าสู่ Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
