"use client";

import { useState, useEffect } from "react";
import { useLineLiff } from "@/app/context/LineLiffContext";
import { apiUrl } from "@/lib/api";
import { phase1Questions } from "@/lib/questions";
import type { Phase1Answers, FeedbackPayload } from "@/lib/types";
import SuccessToast from "./SuccessToast";

const initialPhase1: Phase1Answers = {
  q1: "",
  q2: "",
  q3: "",
};

function hasPhase1Data(p: Phase1Answers): boolean {
  return !!(p.q1.trim() && p.q2.trim() && p.q3.trim());
}

export default function Phase1Form() {
  const { profile } = useLineLiff();
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [phase1, setPhase1] = useState<Phase1Answers>(initialPhase1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase1Submitted, setPhase1Submitted] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(apiUrl(`/api/feedback?lineUserId=${encodeURIComponent(profile.userId)}`))
      .then((res) => (res.status === 200 ? res.json() : null))
      .then((data: FeedbackPayload | null) => {
        if (data?.id) {
          setFeedbackId(data.id);
          if (data.phase1) setPhase1(data.phase1);
          setPhase1Submitted(hasPhase1Data(data.phase1));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [profile?.userId]);

  const setPhase1Field = (id: keyof Phase1Answers, value: string) => {
    setPhase1((prev) => ({ ...prev, [id]: value }));
  };

  const canSubmit = phase1.q1.trim() && phase1.q2.trim() && phase1.q3.trim();

  const submitPhase1 = async () => {
    if (!profile?.userId) return;
    setSubmitting(true);
    setError(null);
    try {
      if (feedbackId) {
        const res = await fetch(apiUrl("/api/feedback"), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: feedbackId, lineUserId: profile.userId, phase1 }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "อัปเดตไม่สำเร็จ");
      } else {
        const res = await fetch(apiUrl("/api/feedback"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phase1,
            lineUserId: profile.userId,
            lineDisplayName: profile.displayName,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "ส่งไม่สำเร็จ");
        if (data.id) setFeedbackId(data.id);
      }
      setPhase1Submitted(true);
      setShowSuccessToast(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-4 py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#ff6a13] border-t-transparent" />
        <p className="text-zinc-500">กำลังโหลดคำตอบของคุณ...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <SuccessToast
        show={showSuccessToast}
        message="ส่งคำตอบแล้ว"
        onClose={() => setShowSuccessToast(false)}
      />
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-[#e7e5e2] bg-white shadow-lg shadow-zinc-200/40">
        <div className="border-l-4 border-[#ff6a13] bg-zinc-50/80 px-5 py-3">
          <h2 className="font-sarabun text-xl font-semibold text-zinc-800">ช่วงคำถามที่ 1</h2>
        </div>
        <div className="space-y-5 p-5 sm:p-6">
          {phase1Questions.map((q) => (
            <div key={q.id}>
              <label className="font-sarabun mb-2 block text-lg font-medium text-zinc-700">
                {q.label}
              </label>
              <textarea
                className="font-sarabun w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-base text-zinc-900 placeholder-zinc-400 transition focus:border-[#ff6a13] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff6a13]/20"
                rows={4}
                placeholder={q.placeholder}
                value={phase1[q.id as keyof Phase1Answers]}
                onChange={(e) => setPhase1Field(q.id as keyof Phase1Answers, e.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-zinc-100 bg-zinc-50/50 px-5 py-4 sm:px-6">
          {phase1Submitted && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1.5 text-sm font-medium text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              บันทึกแล้ว
            </span>
          )}
          <button
            type="button"
            onClick={submitPhase1}
            disabled={!canSubmit || submitting}
            className="rounded-xl bg-[#ff6a13] px-6 py-3 font-medium text-white shadow-md shadow-[#ff6a13]/25 transition hover:bg-[#e55f10] disabled:opacity-50 active:scale-[0.98]"
          >
            {submitting ? "กำลังส่ง..." : "ส่งคำตอบ"}
          </button>
        </div>
      </section>
    </div>
  );
}
