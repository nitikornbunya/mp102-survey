"use client";

import { useState, useEffect } from "react";
import { useLineLiff } from "@/app/context/LineLiffContext";
import { apiUrl } from "@/lib/api";
import { phase2Bases } from "@/lib/questions";
import type { Phase2Answers, BaseAnswers, FeedbackPayload } from "@/lib/types";
import SuccessToast from "./SuccessToast";

const ALL_BASE_IDS = ["base1", "base2", "base3", "base4", "base5", "base6"] as const;

function initialPhase2(): Phase2Answers {
  const phase2: Phase2Answers = {
    base1: {},
    base2: {},
    base3: {},
    base4: {},
    base5: {},
    base6: {},
  };
  phase2Bases.forEach((base) => {
    phase2[base.id as keyof Phase2Answers] = {};
    base.questions.forEach((q) => {
      (phase2[base.id as keyof Phase2Answers] as BaseAnswers)[q.id] = "";
    });
  });
  return phase2;
}

function getSubmittedBasesFromPhase2(phase2: Phase2Answers): Set<string> {
  const set = new Set<string>();
  ALL_BASE_IDS.forEach((baseId) => {
    const answers = phase2[baseId];
    if (answers && Object.values(answers).some((v) => String(v).trim())) set.add(baseId);
  });
  return set;
}

export default function FeedbackForm() {
  const { profile } = useLineLiff();
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [phase2, setPhase2] = useState<Phase2Answers>(initialPhase2());
  const [submittingBase, setSubmittingBase] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submittedBases, setSubmittedBases] = useState<Set<string>>(new Set());
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successToastMessage, setSuccessToastMessage] = useState("ส่งคำตอบแล้ว");
  const [loading, setLoading] = useState(true);

  const setPhase2Field = (baseId: keyof Phase2Answers, qId: string, value: string) => {
    setPhase2((prev) => ({
      ...prev,
      [baseId]: { ...(prev[baseId] || {}), [qId]: value },
    }));
  };

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
          if (data.phase2) setPhase2(data.phase2);
          setSubmittedBases(getSubmittedBasesFromPhase2(data.phase2));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [profile?.userId]);

  const submitBase = async (baseId: string) => {
    if (!profile?.userId) return;
    setSubmittingBase(baseId);
    setError(null);
    try {
      if (feedbackId) {
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
      } else {
        const res = await fetch(apiUrl("/api/feedback"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lineUserId: profile.userId,
            lineDisplayName: profile.displayName,
            phase1: {},
            phase2: { [baseId]: phase2[baseId as keyof Phase2Answers] },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "ส่งไม่สำเร็จ");
        if (data.id) setFeedbackId(data.id);
      }
      setSubmittedBases((prev) => new Set(prev).add(baseId));
      const baseTitle = phase2Bases.find((b) => b.id === baseId)?.title ?? baseId;
      setSuccessToastMessage(`ส่งคำตอบ${baseTitle}แล้ว`);
      setShowSuccessToast(true);
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
      <SuccessToast
        show={showSuccessToast}
        message={successToastMessage}
        onClose={() => setShowSuccessToast(false)}
      />
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
          {error}
        </div>
      )}

      <div className="space-y-5">
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
                {"description" in base && base.description && (
                  <p className="font-sarabun text-base font-medium text-zinc-700">
                    {base.description}
                  </p>
                )}
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
                  disabled={submittingBase === base.id}
                  className="rounded-xl bg-[#ff6a13] px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-[#ff6a13]/20 transition hover:bg-[#e55f10] disabled:opacity-50 active:scale-[0.98]"
                >
                  {submittingBase === base.id ? "กำลังส่ง..." : "ส่งคำตอบ"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
