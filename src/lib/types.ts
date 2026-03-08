// คำตอบแต่ละฐาน (แต่ละฐานมีหลายคำถาม)
export type BaseAnswers = Record<string, string>;

export type Phase2Answers = {
  base1: BaseAnswers;
  base2: BaseAnswers;
  base3: BaseAnswers;
  base4: BaseAnswers;
  base5: BaseAnswers;
  base6: BaseAnswers;
};

/** บทบาท (จาก registrations) */
export type FeedbackRoleKey =
  | "mp_constituency"
  | "mp_list"
  | "provincial_team"
  | "fa_team";

export type FeedbackPayload = {
  id?: string;
  createdAt: string;
  updatedAt?: string;
  phase2: Phase2Answers;
  /** ผูกกับ LINE สำหรับ login และโหลด/แก้ไขภายหลัง */
  lineUserId?: string;
  lineDisplayName?: string;
  /** กลุ่ม (จาก API feedback?all=true) ใช้สำหรับ filter ใน Dashboard */
  groupNumber?: number;
  /** จาก registrations (เมื่อดึง all=true) */
  fullName?: string;
  role?: FeedbackRoleKey;
  provinceId?: string;
  districtId?: number;
  province?: string;
  meta?: { area?: string; name?: string };
};
