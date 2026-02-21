/** บทบาทผู้ใช้ */
export type RoleKey =
  | "mp_constituency"   // ผู้สมัคร สส. เขต
  | "mp_list"           // ผู้สมัคร สส. บัญชีรายชื่อ
  | "provincial_team"   // ทีมจังหวัด
  | "fa_team";     // ส่วนกลางพรรค

export const ROLE_LABELS: Record<RoleKey, string> = {
  mp_constituency: "ผู้สมัคร สส. เขต",
  mp_list: "ผู้สมัคร สส. บัญชีรายชื่อ",
  provincial_team: "ทีมจังหวัด",
  fa_team: "ทีมฟา",
};

export type RegistrationPayload = {
  lineUserId: string;
  lineDisplayName?: string;
  fullName: string;
  role: RoleKey;
  /** สำหรับ สส.เขต */
  provinceId?: string;
  districtId?: string;
  /** สำหรับ ทีมจังหวัด: รหัสจังหวัด */
  province?: string;
  /** กลุ่มที่อยู่ ในงานสัมมนา 1-40 */
  groupNumber: number;
  createdAt: string;
  updatedAt?: string;
};
