"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiUrl } from "@/lib/api";
import { phase1Questions, phase2Bases } from "@/lib/questions";
import { ROLE_LABELS } from "@/lib/registration-types";
import type { FeedbackPayload } from "@/lib/types";
import type { RoleKey } from "@/lib/registration-types";
import LineLoginGate from "@/app/components/LineLoginGate";

function provinceDistrictLabel(item: FeedbackPayload): string {
  if (item.provinceId && item.districtId != null) return `${item.provinceId} เขต ${item.districtId}`;
  if (item.province) return item.province;
  return "—";
}

function answerMeta(item: FeedbackPayload) {
  const name = item.fullName?.trim() || item.lineDisplayName?.trim() || "—";
  const role = item.role ? ROLE_LABELS[item.role as RoleKey] : "—";
  const area = provinceDistrictLabel(item);
  return { name, role, area };
}

type TabId = "phase1" | "phase2";

export default function DashboardPage() {
  const [tab, setTab] = useState<TabId>("phase1");
  const [list, setList] = useState<FeedbackPayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterBase, setFilterBase] = useState<string>("all");
  const [filterGroup, setFilterGroup] = useState<string>("all");

  const listForPhase2 =
    filterGroup === "all"
      ? list
      : list.filter((item) => item.groupNumber === Number(filterGroup));

  useEffect(() => {
    fetch(apiUrl("/api/feedback?all=true"))
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setError("โหลดข้อมูลไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#ff6a13] border-t-transparent" />
        <p className="text-zinc-500">กำลังโหลด...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
        {error}
      </div>
    );
  }

  return (
    <LineLoginGate requireRegistration={false}>
      <div className="min-h-screen bg-[#faf9f7]">
      <header className="border-b border-[#e7e5e2] bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <h1 className="text-xl font-bold text-zinc-800 sm:text-2xl">Dashboard</h1>
          <Link
            href="/"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
          >
            ← กลับหน้าฟอร์ม
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6 rounded-2xl border border-[#e7e5e2] bg-white p-5 shadow-lg shadow-zinc-200/40 sm:p-6">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">จำนวนรายการ</p>
          <p className="mt-1 text-3xl font-bold text-[#ff6a13] sm:text-4xl">{list.length}</p>
          <p className="mt-1 text-sm text-zinc-600">คำตอบทั้งหมด</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl border border-[#e7e5e2] bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setTab("phase1")}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              tab === "phase1"
                ? "bg-[#ff6a13] text-white shadow"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-800"
            }`}
          >
            ช่วงคำถามที่ 1
          </button>
          <button
            type="button"
            onClick={() => setTab("phase2")}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              tab === "phase2"
                ? "bg-[#ff6a13] text-white shadow"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-800"
            }`}
          >
            ช่วงคำถามที่ 2
          </button>
        </div>

        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#e7e5e2] bg-white py-16 shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-zinc-600">ยังไม่มีคำตอบ</p>
            <p className="mt-1 text-sm text-zinc-500">เมื่อมีผู้ส่งคำตอบ จะแสดงในหน้านี้</p>
          </div>
        ) : tab === "phase1" ? (
          <Phase1View list={list} />
        ) : (
          <Phase2View
            list={listForPhase2}
            filterBase={filterBase}
            filterGroup={filterGroup}
            onFilterBase={setFilterBase}
            onFilterGroup={setFilterGroup}
          />
        )}
      </div>
    </div>
    </LineLoginGate>
  );
}

function Phase1View({ list }: { list: FeedbackPayload[] }) {
  return (
    <div className="space-y-8">
      {phase1Questions.map((q) => {
        const entries = list
          .map((item) => {
            const text = item.phase1?.[q.id as keyof typeof item.phase1]?.trim();
            return text ? { text, item } : null;
          })
          .filter((e): e is { text: string; item: FeedbackPayload } => !!e);
        return (
          <div key={q.id} className="overflow-hidden rounded-2xl border border-[#e7e5e2] bg-white shadow-md shadow-zinc-200/30">
            <div className="border-l-4 border-[#ff6a13] bg-zinc-50/80 px-5 py-3">
              <h3 className="font-sarabun text-lg font-semibold text-zinc-800">{q.label}</h3>
            </div>
            <ul className="divide-y divide-zinc-100 px-5 py-2">
              {entries.length === 0 ? (
                <li className="font-sarabun py-4 text-base text-zinc-500">— ยังไม่มีคำตอบ</li>
              ) : (
                entries.map(({ text, item }, i) => {
                  const { name, role, area } = answerMeta(item);
                  return (
                    <li key={i} className="font-sarabun py-3">
                      <p className="text-base text-zinc-800 leading-relaxed whitespace-pre-wrap">{text}</p>
                      <p className="mt-1.5 text-xs text-zinc-400">
                        {name} · {role} · {area}
                      </p>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function Phase2View({
  list,
  filterBase,
  filterGroup,
  onFilterBase,
  onFilterGroup,
}: {
  list: FeedbackPayload[];
  filterBase: string;
  filterGroup: string;
  onFilterBase: (v: string) => void;
  onFilterGroup: (v: string) => void;
}) {
  const basesToShow = filterBase === "all" ? phase2Bases : phase2Bases.filter((b) => b.id === filterBase);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#e7e5e2] bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-zinc-600">ฐาน:</label>
          <select
            value={filterBase}
            onChange={(e) => onFilterBase(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:border-[#ff6a13] focus:outline-none focus:ring-2 focus:ring-[#ff6a13]/20"
          >
            <option value="all">ทั้งหมด</option>
            {phase2Bases.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-zinc-600">กลุ่มที่:</label>
          <select
            value={filterGroup}
            onChange={(e) => onFilterGroup(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:border-[#ff6a13] focus:outline-none focus:ring-2 focus:ring-[#ff6a13]/20"
          >
            <option value="all">ทั้งหมด</option>
            {Array.from({ length: 40 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={String(n)}>
                กลุ่ม {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-8">
        {basesToShow.map((base) =>
          base.questions.map((q) => {
            const entries = list
              .map((item) => {
                const baseAnswers = item.phase2?.[base.id as keyof typeof item.phase2];
                if (!baseAnswers || typeof baseAnswers !== "object") return null;
                const val = (baseAnswers as Record<string, string>)[q.id];
                const text = typeof val === "string" ? val.trim() : null;
                return text ? { text, item } : null;
              })
              .filter((e): e is { text: string; item: FeedbackPayload } => !!e);
            return (
              <div
                key={`${base.id}-${q.id}`}
                className="overflow-hidden rounded-2xl border border-[#e7e5e2] bg-white shadow-md shadow-zinc-200/30"
              >
                <div className="border-l-4 border-[#ff6a13] bg-zinc-50/80 px-5 py-3">
                  <p className="font-sarabun text-xs font-medium uppercase text-zinc-500">{base.title}</p>
                  <h3 className="font-sarabun mt-0.5 text-lg font-semibold text-zinc-800">
                    {q.id} {q.label}
                  </h3>
                </div>
                <ul className="divide-y divide-zinc-100 px-5 py-2">
                  {entries.length === 0 ? (
                    <li className="font-sarabun py-4 text-base text-zinc-500">— ยังไม่มีคำตอบ</li>
                  ) : (
                    entries.map(({ text, item }, i) => {
                      const { name, role, area } = answerMeta(item);
                      return (
                        <li key={i} className="font-sarabun py-3">
                          <p className="text-base text-zinc-800 leading-relaxed whitespace-pre-wrap">{text}</p>
                          <p className="mt-1.5 text-xs text-zinc-400">
                            {name} · {role} · {area}
                          </p>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
