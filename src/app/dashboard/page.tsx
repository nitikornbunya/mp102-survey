"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiUrl } from "@/lib/api";
import { phase1Questions, phase2Bases } from "@/lib/questions";
import { ROLE_LABELS } from "@/lib/registration-types";
import type { FeedbackPayload } from "@/lib/types";
import type { RoleKey } from "@/lib/registration-types";

function ChevronDownIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

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

type FetchPhaseOptions = {
  hasPhase1?: boolean;
  hasPhase2?: boolean;
  groupNumber?: string; // ตัวเลขเดียว หรือหลายกลุ่มคั่นด้วย comma เช่น "5" หรือ "1,2,3"
};

export default function DashboardPage() {
  const [tab, setTab] = useState<TabId>("phase1");
  const [phase1List, setPhase1List] = useState<FeedbackPayload[]>([]);
  const [phase2List, setPhase2List] = useState<FeedbackPayload[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filterBase, setFilterBase] = useState<string>("all");
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [phase1HasSearched, setPhase1HasSearched] = useState(false);
  const [phase2HasSearched, setPhase2HasSearched] = useState(false);

  const fetchList = (options: FetchPhaseOptions, setData: (data: FeedbackPayload[]) => void) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ all: "true" });
    if (options.hasPhase1 === true) params.set("hasPhase1", "true");
    if (options.hasPhase2 === true) params.set("hasPhase2", "true");
    if (options.groupNumber && options.groupNumber !== "all") {
      params.set("groupNumber", options.groupNumber);
    }
    const url = apiUrl(`/api/feedback?${params.toString()}`);
    fetch(url)
      .then((r) => r.json())
      .then((data) => setData(Array.isArray(data) ? data : []))
      .catch(() => setError("โหลดข้อมูลไม่สำเร็จ"))
      .finally(() => setLoading(false));
  };

  const handlePhase1Search = () => {
    fetchList({ hasPhase1: true }, setPhase1List);
    setPhase1HasSearched(true);
  };

  const handlePhase2Search = () => {
    const groupNumber = filterGroup === "all" ? undefined : filterGroup;
    fetchList({ hasPhase2: true, groupNumber }, setPhase2List);
    setPhase2HasSearched(true);
  };

  const handlePhase2Refresh = () => {
    const groupNumber = filterGroup === "all" ? undefined : filterGroup;
    fetchList({ hasPhase2: true, groupNumber }, setPhase2List);
  };

  const currentList = tab === "phase1" ? phase1List : phase2List;
  const currentHasSearched = tab === "phase1" ? phase1HasSearched : phase2HasSearched;

  if (loading && currentList.length === 0 && currentHasSearched) {
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
          <p className="mt-1 text-3xl font-bold text-[#ff6a13] sm:text-4xl">
            {tab === "phase1" ? phase1List.length : phase2List.length}
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            {tab === "phase1" ? "คำตอบช่วงที่ 1" : "คำตอบช่วงที่ 2"}
          </p>
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

        {tab === "phase1" && !phase1HasSearched ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#e7e5e2] bg-white py-16 shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-zinc-600">กดปุ่ม ค้นหา เพื่อโหลดข้อมูล</p>
            <p className="mt-1 text-sm text-zinc-500">เมื่อมีผู้ส่งคำตอบ จะแสดงในหน้านี้</p>
            <button
              type="button"
              onClick={handlePhase1Search}
              disabled={loading}
              className="mt-6 flex items-center gap-2 rounded-xl bg-[#ff6a13] px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#e55f0f] disabled:opacity-60"
            >
              <SearchIcon />
              ค้นหา
            </button>
          </div>
        ) : tab === "phase1" ? (
          <Phase1View list={phase1List} onRefresh={handlePhase1Search} isLoading={loading} />
        ) : (
          <Phase2View
            list={phase2List}
            filterBase={filterBase}
            filterGroup={filterGroup}
            onFilterBase={setFilterBase}
            onFilterGroup={setFilterGroup}
            hasSearched={phase2HasSearched}
            onSearch={handlePhase2Search}
            onRefresh={handlePhase2Refresh}
            isLoading={loading}
          />
        )}
      </div>
    </div>
  );
}

function Phase1View({
  list,
  onRefresh,
  isLoading,
}: {
  list: FeedbackPayload[];
  onRefresh: () => void;
  isLoading: boolean;
}) {
  const allIds = phase1Questions.map((q) => q.id);
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(allIds));

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:opacity-60"
        >
          <RefreshIcon />
          รีเฟรช
        </button>
      </div>
      <div className="space-y-8">
      {phase1Questions.map((q) => {
        const entries = list
          .map((item) => {
            const text = item.phase1?.[q.id as keyof typeof item.phase1]?.trim();
            return text ? { text, item } : null;
          })
          .filter((e): e is { text: string; item: FeedbackPayload } => !!e);
        const isOpen = openIds.has(q.id);
        return (
          <div key={q.id} className="overflow-hidden rounded-2xl border border-[#e7e5e2] bg-white shadow-md shadow-zinc-200/30">
            <button
              type="button"
              onClick={() => toggle(q.id)}
              className="flex w-full cursor-pointer items-center justify-between gap-3 border-l-4 border-[#ff6a13] bg-zinc-50/80 px-5 py-3 text-left transition hover:bg-zinc-100/80"
              aria-expanded={isOpen}
            >
              <h3 className="font-sarabun text-lg font-semibold text-zinc-800">{q.label}</h3>
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                aria-hidden
              >
                <ChevronDownIcon />
              </span>
            </button>
            {isOpen && (
              <ul className="divide-y divide-zinc-100 px-5 py-2">
                {entries.length === 0 ? (
                  <li className="font-sarabun py-4 text-base text-zinc-500">— ยังไม่มีคำตอบ</li>
                ) : (
                  entries.map(({ text, item }, i) => {
                    const { role } = answerMeta(item);
                    return (
                      <li key={i} className="font-sarabun py-3">
                        <p className="text-base text-zinc-800 leading-relaxed whitespace-pre-wrap">{text}</p>
                        <p className="mt-1.5 text-xs text-zinc-400">{role}</p>
                      </li>
                    );
                  })
                )}
              </ul>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}

function Phase2Section({
  sectionId,
  baseTitle,
  questionId,
  questionLabel,
  entries,
  openIds,
  onToggle,
}: {
  sectionId: string;
  baseTitle: string;
  questionId: string;
  questionLabel: string;
  entries: { text: string; item: FeedbackPayload }[];
  openIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const isOpen = openIds.has(sectionId);
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e7e5e2] bg-white shadow-md shadow-zinc-200/30">
      <button
        type="button"
        onClick={() => onToggle(sectionId)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 border-l-4 border-[#ff6a13] bg-zinc-50/80 px-5 py-3 text-left transition hover:bg-zinc-100/80"
        aria-expanded={isOpen}
      >
        <div>
          <p className="font-sarabun text-xs font-medium uppercase text-zinc-500">{baseTitle}</p>
          <h3 className="font-sarabun mt-0.5 text-lg font-semibold text-zinc-800">
            {questionId} {questionLabel}
          </h3>
        </div>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden
        >
          <ChevronDownIcon />
        </span>
      </button>
      {isOpen && (
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
      )}
    </div>
  );
}

function Phase2View({
  list,
  filterBase,
  filterGroup,
  onFilterBase,
  onFilterGroup,
  hasSearched,
  onSearch,
  onRefresh,
  isLoading,
}: {
  list: FeedbackPayload[];
  filterBase: string;
  filterGroup: string;
  onFilterBase: (v: string) => void;
  onFilterGroup: (v: string) => void;
  hasSearched: boolean;
  onSearch: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}) {
  const basesToShow = filterBase === "all" ? phase2Bases : phase2Bases.filter((b) => b.id === filterBase);
  const allPhase2Ids = basesToShow.flatMap((base) =>
    base.questions.map((q) => `${base.id}-${q.id}`)
  );
  const [phase2OpenIds, setPhase2OpenIds] = useState<Set<string>>(() => new Set(allPhase2Ids));

  useEffect(() => {
    setPhase2OpenIds((prev) => {
      const next = new Set(prev);
      allPhase2Ids.forEach((id) => next.add(id));
      return next;
    });
  }, [filterBase, filterGroup]);

  const phase2Toggle = (id: string) => {
    setPhase2OpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#e7e5e2] bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-zinc-600">ชุดคำถาม:</label>
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
        {!hasSearched ? (
          <button
            type="button"
            onClick={onSearch}
            className="ml-auto flex items-center gap-2 rounded-xl bg-[#ff6a13] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#e55f0f]"
          >
            <SearchIcon />
            ค้นหา
          </button>
        ) : (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="ml-auto flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:opacity-60"
          >
            <RefreshIcon />
            รีเฟรช
          </button>
        )}
      </div>

      {!hasSearched ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#e7e5e2] bg-white py-16 shadow-sm">
          <p className="text-zinc-500">เลือกฐานและกลุ่ม (ถ้าต้องการ) แล้วกดปุ่ม <strong>ค้นหา</strong> เพื่อโหลดข้อมูล</p>
        </div>
      ) : isLoading && list.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-2xl border border-[#e7e5e2] bg-white py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#ff6a13] border-t-transparent" />
          <p className="text-zinc-500">กำลังโหลด...</p>
        </div>
      ) : (
      <div className="space-y-8">
        {basesToShow.map((base) =>
          base.questions.map((q) => {
            const sectionId = `${base.id}-${q.id}`;
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
              <Phase2Section
                key={sectionId}
                sectionId={sectionId}
                baseTitle={base.title}
                questionId={q.id}
                questionLabel={q.label}
                entries={entries}
                openIds={phase2OpenIds}
                onToggle={phase2Toggle}
              />
            );
          })
        )}
      </div>
      )}
    </div>
  );
}
