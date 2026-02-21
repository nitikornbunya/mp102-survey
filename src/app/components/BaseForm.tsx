"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLineLiff } from "@/app/context/LineLiffContext";
import { apiUrl } from "@/lib/api";
import { phase2Bases } from "@/lib/questions";
import type { Phase2Answers, BaseAnswers, FeedbackPayload } from "@/lib/types";
import SuccessToast from "./SuccessToast";

type BaseId = "base1" | "base2" | "base3" | "base4";

function initialBaseAnswers(baseId: BaseId): BaseAnswers {
  const base = phase2Bases.find((b) => b.id === baseId);
  const out: BaseAnswers = {};
  base?.questions.forEach((q) => { out[q.id] = ""; });
  return out;
}

type Props = { baseId: BaseId };

export default function BaseForm({ baseId }: Props) {
  const { profile } = useLineLiff();
  const base = phase2Bases.find((b) => b.id === baseId)!;
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<BaseAnswers>(() => initialBaseAnswers(baseId));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
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
          const baseData = data.phase2?.[baseId as keyof Phase2Answers];
          if (baseData && typeof baseData === "object") {
            setAnswers((prev) => ({ ...prev, ...(baseData as BaseAnswers) }));
            const hasAny = Object.values(baseData).some((v) => String(v).trim());
            setSubmitted(hasAny);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [profile?.userId, baseId]);

  const setField = (qId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const canSubmit = base.questions.every((q) => (answers[q.id] ?? "").trim());

  const submit = async () => {
    if (!feedbackId || !profile?.userId) {
      setError("กรุณาส่งคำตอบช่วงที่ 1 ที่หน้าหลักก่อน");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(apiUrl("/api/feedback"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: feedbackId,
          lineUserId: profile.userId,
          phase2: { [baseId]: answers },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ส่งไม่สำเร็จ");
      setSubmitted(true);
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

      {!feedbackId && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-800">
          กรุณาส่งคำตอบช่วงที่ 1 ที่{" "}
          <Link href="/" className="font-medium underline">
            หน้าหลัก
          </Link>{" "}
          ก่อน จึงจะส่งคำตอบชุดนี้ได้
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-[#e7e5e2] bg-white shadow-lg shadow-zinc-200/40">
        <div className="border-l-4 border-[#ff6a13] bg-zinc-50/80 px-5 py-3">
          <h2 className="font-sarabun text-xl font-semibold text-zinc-800">{base.title}</h2>
        </div>
        <div className="space-y-4 p-5 sm:p-6">
          {base.questions.map((q) => (
            <div key={q.id}>
              <label className="font-sarabun mb-1.5 block text-lg font-medium text-zinc-700">
                {q.id} {q.label}
              </label>
              {"type" in q && q.type === "rating" ? (
                <input
                  type="number"
                  min={(q as { min?: number }).min ?? 1}
                  max={(q as { max?: number }).max ?? 10}
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setField(q.id, e.target.value)}
                  placeholder={q.placeholder}
                  className="font-sarabun w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-base text-zinc-900 placeholder-zinc-400 transition focus:border-[#ff6a13] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff6a13]/20"
                />
              ) : (
                <textarea
                  className="font-sarabun w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-2.5 text-base text-zinc-900 placeholder-zinc-400 transition focus:border-[#ff6a13] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff6a13]/20"
                  rows={3}
                  placeholder={q.placeholder}
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setField(q.id, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-zinc-100 bg-zinc-50/50 px-5 py-4 sm:px-6">
          {submitted && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1.5 text-sm font-medium text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              บันทึกแล้ว
            </span>
          )}
          <button
            type="button"
            onClick={submit}
            disabled={!feedbackId || !canSubmit || submitting}
            className="rounded-xl bg-[#ff6a13] px-6 py-3 font-medium text-white shadow-md shadow-[#ff6a13]/25 transition hover:bg-[#e55f10] disabled:opacity-50 active:scale-[0.98]"
          >
            {submitting ? "กำลังส่ง..." : "ส่งคำตอบ"}
          </button>
          <Link
            href="/"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
          >
            ← หน้าหลัก
          </Link>
        </div>
      </section>
    </div>
  );
}
