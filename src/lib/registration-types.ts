/** บทบาทผู้ใช้ */
export type RoleKey =
  | "regional_coordinator"
  | "provincial_coordinator"
  | "mayor"
  | "sao_president"
  | "pao_president"
  | "bma_council"
  | "pao_council"
  | "municipal_council"
  | "sao_council"
  | "lao_team";

export const ROLE_LABELS: Record<RoleKey, string> = {
  regional_coordinator: "ผู้ประสานงานภาค / รองเลขาภาค",
  provincial_coordinator: "ผู้ประสานงานจังหวัด / ตัวแทนจังหวัด",
  mayor: "นายกเทศมนตรี (นายกเทศบาล)",
  sao_president: "นายกองค์การบริหารส่วนตำบล (อบต.)",
  pao_president: "นายกองค์การบริหารส่วนจังหวัด (อบจ.)",
  bma_council: "สมาชิกสภากรุงเทพฯ",
  pao_council: "สมาชิกสภาองค์การบริหารส่วนจังหวัด (ส.อบจ.)",
  municipal_council: "สมาชิกสภาเทศบาล (สท.)",
  sao_council: "สมาชิกสภา อบต. (ส.อบต.)",
  lao_team: "ทีมนายก อปท.",
};

export type RegistrationPayload = {
  lineUserId: string;
  lineDisplayName?: string;
  fullName: string;
  role: RoleKey;
  /** กลุ่มที่อยู่ ในงานสัมมนา 1-40 */
  groupNumber: number;
  createdAt: string;
  updatedAt?: string;
};
