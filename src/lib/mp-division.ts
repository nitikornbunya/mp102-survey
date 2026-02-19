/**
 * โครงสร้างข้อมูลจาก public/mp-division.json
 * ใช้สำหรับ dropdown จังหวัด/เขตเลือกตั้ง
 */
export type MpDivisionProvince = {
  province: string;
  districtCount: number;
  districts: number[];
};

export type MpDivision = {
  provinces: MpDivisionProvince[];
};

const MP_DIVISION_URL = "/mp-division.json";
let cached: MpDivision | null = null;

/**
 * โหลดข้อมูลจังหวัดและเขตเลือกตั้ง (cache ครั้งแรก)
 */
export async function loadMpDivision(): Promise<MpDivision> {
  if (cached) return cached;
  const res = await fetch(MP_DIVISION_URL);
  if (!res.ok) throw new Error("โหลดข้อมูลจังหวัด-เขตไม่สำเร็จ");
  const data = (await res.json()) as MpDivision;
  if (!data?.provinces?.length) throw new Error("รูปแบบข้อมูลจังหวัด-เขตไม่ถูกต้อง");
  cached = data;
  return data;
}
