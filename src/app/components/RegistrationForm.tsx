"use client";

import { useState, useEffect } from "react";
import type { LineProfile } from "@/app/context/LineLiffContext";
import { apiUrl } from "@/lib/api";
import { ROLE_LABELS, type RoleKey } from "@/lib/registration-types";
import { loadMpDivision } from "@/lib/mp-division";
import SearchableSelect from "@/app/components/SearchableSelect";

const ROLE_OPTIONS: RoleKey[] = [
  "mp_constituency",
  "mp_list",
  "provincial_team",
  // "party_center",
];

type Props = {
  profile: LineProfile;
  onSuccess: () => void;
};

export default function RegistrationForm({ profile, onSuccess }: Props) {
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<RoleKey | "">("");
  const [provinceId, setProvinceId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [provinceTeamId, setProvinceTeamId] = useState("");
  const [groupNumber, setGroupNumber] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mpDivision, setMpDivision] = useState<Awaited<ReturnType<typeof loadMpDivision>> | null>(null);
  const [loadingDivision, setLoadingDivision] = useState(true);

  const provinces = mpDivision?.provinces ?? [];
  const selectedProvince = provinces.find((p) => p.province === provinceId);
  const districts = selectedProvince?.districts ?? [];

  useEffect(() => {
    loadMpDivision()
      .then(setMpDivision)
      .catch(() => setError("โหลดรายการจังหวัดไม่สำเร็จ"))
      .finally(() => setLoadingDivision(false));
  }, []);

  useEffect(() => {
    if (role !== "mp_constituency") {
      setProvinceId("");
      setDistrictId("");
    }
    if (role !== "provincial_team") setProvinceTeamId("");
  }, [role]);

  const canSubmit =
    fullName.trim() &&
    role &&
    (role !== "mp_constituency" || (provinceId && districtId)) &&
    (role !== "provincial_team" || provinceTeamId) &&
    groupNumber !== "" &&
    Number(groupNumber) >= 1 &&
    Number(groupNumber) <= 30;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !profile.userId) return;
    setSubmitting(true);
    setError(null);
    try {
      // ส่ง provinceId เป็นชื่อจังหวัดภาษาไทย, districtId เป็นตัวเลขเขต
      const districtNum =
        role === "mp_constituency" && districtId ? Number(districtId) : undefined;

      const res = await fetch(apiUrl("/api/registration"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineUserId: profile.userId,
          lineDisplayName: profile.displayName,
          fullName: fullName.trim(),
          role,
          provinceId: role === "mp_constituency" ? provinceId || undefined : undefined,
          districtId: districtNum,
          province: role === "provincial_team" ? provinceTeamId || undefined : undefined,
          groupNumber: Number(groupNumber),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "บันทึกไม่สำเร็จ");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-xl space-y-6 overflow-hidden rounded-2xl border border-[#e7e5e2] bg-white shadow-lg shadow-zinc-200/40"
    >
      <div className="border-l-4 border-[#ff6a13] bg-zinc-50/80 px-5 py-4">
        <h2 className="text-lg font-semibold text-zinc-800">ลงทะเบียน</h2>
        <p className="mt-1 text-sm text-zinc-600">
          กรอกข้อมูลก่อนเข้าสู่แบบฟอร์มรับฟังความคิดเห็น
        </p>
      </div>

      <div className="space-y-5 px-5 pb-2 sm:px-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            1. ชื่อ-นามสกุล <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="กรอกชื่อ-นามสกุล"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-zinc-900 placeholder-zinc-400 transition focus:border-[#ff6a13] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff6a13]/20"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            2. บทบาท <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {ROLE_OPTIONS.map((key) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 transition has-[:checked]:border-[#ff6a13] has-[:checked]:bg-[#ff6a13]/5 has-[:checked]:ring-2 has-[:checked]:ring-[#ff6a13]/20"
              >
                <input
                  type="radio"
                  name="role"
                  value={key}
                  checked={role === key}
                  onChange={() => setRole(key)}
                  className="h-4 w-4 border-zinc-300 text-[#ff6a13] focus:ring-[#ff6a13]"
                />
                <span className="text-zinc-800">{ROLE_LABELS[key]}</span>
              </label>
            ))}
          </div>

          {role === "mp_constituency" && (
            <div className="mt-4 space-y-4 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4">
              <p className="text-sm font-medium text-zinc-600">จังหวัด-เขต</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">จังหวัด</label>
                  <SearchableSelect
                    value={provinceId}
                    onChange={(v) => {
                      setProvinceId(v);
                      setDistrictId("");
                    }}
                    options={provinces.map((p) => ({ value: p.province, label: p.province }))}
                    placeholder="ค้นหาหรือเลือกจังหวัด..."
                    disabled={loadingDivision}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">เขต</label>
                  <select
                    value={districtId}
                    onChange={(e) => setDistrictId(e.target.value)}
                    disabled={!provinceId || loadingDivision}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 focus:border-[#ff6a13] focus:outline-none focus:ring-1 focus:ring-[#ff6a13]"
                  >
                    <option value="">-- เลือกเขต --</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        เขต {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {role === "provincial_team" && (
            <div className="mt-4">
              <label className="mb-1.5 block text-sm text-zinc-600">เลือกจังหวัด</label>
              <SearchableSelect
                value={provinceTeamId}
                onChange={setProvinceTeamId}
                options={provinces.map((p) => ({ value: p.province, label: p.province }))}
                placeholder="ค้นหาหรือเลือกจังหวัด..."
                disabled={loadingDivision}
                className="rounded-xl border-zinc-200 bg-zinc-50/50 px-4 py-3 focus:ring-2 focus:ring-[#ff6a13]/20"
              />
            </div>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            3. กลุ่มที่อยู่ ในงานสัมมนา <span className="text-red-500">*</span>
          </label>
          <p className="mb-2 text-xs text-zinc-500">เป็นเลข 1 ถึง 30</p>
          <input
            type="number"
            min={1}
            max={30}
            value={groupNumber === "" ? "" : groupNumber}
            onChange={(e) => {
              const v = e.target.value;
              setGroupNumber(v === "" ? "" : Math.min(30, Math.max(1, Number(v))));
            }}
            placeholder="1-30"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-zinc-900 placeholder-zinc-400 transition focus:border-[#ff6a13] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff6a13]/20"
            required
          />
        </div>
      </div>

      <div className="border-t border-zinc-100 bg-zinc-50/50 px-5 py-4 sm:px-6">
        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="w-full rounded-xl bg-[#ff6a13] py-3.5 font-medium text-white shadow-md shadow-[#ff6a13]/25 transition hover:bg-[#e55f10] disabled:opacity-50 active:scale-[0.99]"
        >
          {submitting ? "กำลังบันทึก..." : "ลงทะเบียนและเข้าสู่แบบฟอร์ม"}
        </button>
      </div>
    </form>
  );
}
