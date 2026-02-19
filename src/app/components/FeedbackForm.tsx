"use client";

import { useState, useEffect } from "react";
import { useLineLiff } from "@/app/context/LineLiffContext";
import { apiUrl } from "@/lib/api";
import { phase1Questions, phase2Bases } from "@/lib/questions";
import type { Phase1Answers, Phase2Answers, BaseAnswers, FeedbackPayload } from "@/lib/types";

const initialPhase1: Phase1Answers = {
  q1: "",
  q2: "",
  q3: "",
};

function initialPhase2(): Phase2Answers {
  const phase2: Phase2Answers = { base1: {}, base2: {}, base3: {}, base4: {} };
  phase2Bases.forEach((base) => {
    phase2[base.id as keyof Phase2Answers] = {};
    base.questions.forEach((q) => {
      (phase2[base.id as keyof Phase2Answers] as BaseAnswers)[q.id] = "";
    });
  });
  return phase2;
}

function hasPhase1Data(p: Phase1Answers): boolean {
  return !!(p.q1.trim() && p.q2.trim() && p.q3.trim());
}

function getSubmittedBasesFromPhase2(phase2: Phase2Answers): Set<string> {
  const set = new Set<string>();
  (["base1", "base2", "base3", "base4"] as const).forEach((baseId) => {
    const answers = phase2[baseId];
    if (answers && Object.values(answers).some((v) => String(v).trim())) set.add(baseId);
  });
  return set;
}

export default function FeedbackForm() {
  const { profile } = useLineLiff();
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [step, setStep] = useState<"phase1" | "phase2">("phase1");
  const [phase1, setPhase1] = useState<Phase1Answers>(initialPhase1);
  const [phase2, setPhase2] = useState<Phase2Answers>(initialPhase2());
  const [submitting, setSubmitting] = useState(false);
  const [submittingBase, setSubmittingBase] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase1Submitted, setPhase1Submitted] = useState(false);
  const [submittedBases, setSubmittedBases] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const setPhase1Field = (id: keyof Phase1Answers, value: string) => {
    setPhase1((prev) => ({ ...prev, [id]: value }));
  };

  const setPhase2Field = (baseId: keyof Phase2Answers, qId: string, value: string) => {
    setPhase2((prev) => ({
      ...prev,
      [baseId]: { ...(prev[baseId] || {}), [qId]: value },
    }));
  };

  const canSubmitPhase1 = phase1.q1.trim() && phase1.q2.trim() && phase1.q3.trim();

  // โหลด feedback ตาม LINE user (หลัง login แล้ว)
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
          if (data.phase2) setPhase2(data.phase2);
          setPhase1Submitted(hasPhase1Data(data.phase1));
          setSubmittedBases(getSubmittedBasesFromPhase2(data.phase2));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [profile?.userId]);

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
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const submitBase = async (baseId: string) => {
    if (!feedbackId || !profile?.userId) {
      setError("กรุณาส่งคำตอบช่วงที่ 1 ก่อน");
      return;
    }
    setSubmittingBase(baseId);
    setError(null);
    try {
      const res = await fetch(apiUrl("/api/feedback"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: feedbackId,
          lineUserId: profile.userId,
          phase2: { [baseId]: phase2[baseId as keyof Phase2Answers] },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ส่งไม่สำเร็จ");
      setSubmittedBases((prev) => new Set(prev).add(baseId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setSubmittingBase(null);
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
    <div className="mx-auto max-w-2xl space-y-8">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {/* ช่วงที่ 1 */}
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
            disabled={!canSubmitPhase1 || submitting}
            className="rounded-xl bg-[#ff6a13] px-6 py-3 font-medium text-white shadow-md shadow-[#ff6a13]/25 transition hover:bg-[#e55f10] disabled:opacity-50 active:scale-[0.98]"
          >
            {submitting ? "กำลังส่ง..." : "ส่งคำตอบ"}
          </button>
          {feedbackId && (
            <button
              type="button"
              onClick={() => setStep("phase2")}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
            >
              ไปช่วงคำถามที่ 2 →
            </button>
          )}
        </div>
      </section>

      {/* ช่วงที่ 2 - ส่งเป็นชุดรายฐาน */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-sarabun text-xl font-semibold text-zinc-800">
            ช่วงคำถามที่ 2 (ตาม 4 ฐาน)
          </h2>
          {step === "phase1" && feedbackId && (
            <button
              type="button"
              onClick={() => setStep("phase2")}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#ff6a13] transition hover:bg-[#ff6a13]/10"
            >
              ไปช่วงที่ 2 →
            </button>
          )}
        </div>

        {step === "phase2" && (
          <div className="space-y-5">
            {!feedbackId && (
              <p className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-800">
                กรุณากดส่งคำตอบช่วงที่ 1 ก่อน จึงจะส่งคำตอบแต่ละฐานได้
              </p>
            )}
            {phase2Bases.map((base) => {
              const baseSubmitted = submittedBases.has(base.id);
              return (
                <div
                  key={base.id}
                  className="overflow-hidden rounded-2xl border border-[#e7e5e2] bg-white shadow-md shadow-zinc-200/30"
                >
                  <div className="border-l-4 border-[#ff6a13] bg-zinc-50/80 px-4 py-2.5">
                    <h3 className="font-sarabun text-lg font-medium text-zinc-800">{base.title}</h3>
                  </div>
                  <div className="space-y-4 p-4 sm:p-5">
                    {base.questions.map((q) => (
                      <div key={q.id}>
                        <label className="font-sarabun mb-1.5 block text-lg font-medium text-zinc-600">
                          {q.id} {q.label}
                        </label>
                        <textarea
                          className="font-sarabun w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-2.5 text-base text-zinc-900 placeholder-zinc-400 transition focus:border-[#ff6a13] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff6a13]/20"
                          rows={3}
                          placeholder={q.placeholder}
                          value={(phase2[base.id as keyof Phase2Answers] as BaseAnswers)?.[q.id] ?? ""}
                          onChange={(e) =>
                            setPhase2Field(base.id as keyof Phase2Answers, q.id, e.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 border-t border-zinc-100 bg-zinc-50/50 px-4 py-3 sm:px-5">
                    {baseSubmitted && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        บันทึกแล้ว
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => submitBase(base.id)}
                      disabled={!feedbackId || submittingBase === base.id}
                      className="rounded-xl bg-[#ff6a13] px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-[#ff6a13]/20 transition hover:bg-[#e55f10] disabled:opacity-50 active:scale-[0.98]"
                    >
                      {submittingBase === base.id ? "กำลังส่ง..." : "ส่งคำตอบ"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
