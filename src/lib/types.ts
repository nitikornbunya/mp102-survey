// คำตอบช่วงที่ 1 (3 คำถาม)
export type Phase1Answers = {
  q1: string; // ผลการเลือกตั้งที่ผ่านมา สะท้อนอะไรบ้าง
  q2: string; // เพราะอะไร คะแนนพรรคจึงลดลงในการเลือกตั้ง 69
  q3: string; // ต้องทำอะไรบ้าง เพื่อให้ชนะเลือกตั้งในครั้งหน้า
};

// คำตอบช่วงที่ 2 ตามฐาน (แต่ละฐานมีหลายคำถาม)
export type BaseAnswers = Record<string, string>;

export type Phase2Answers = {
  base1: BaseAnswers; // ฐาน 1
  base2: BaseAnswers; // ฐาน 2
  base3: BaseAnswers; // ฐาน 3 (placeholder)
  base4: BaseAnswers; // ฐาน 4 (placeholder)
};

export type FeedbackPayload = {
  id?: string;
  createdAt: string;
  updatedAt?: string;
  phase1: Phase1Answers;
  phase2: Phase2Answers;
  /** ผูกกับ LINE สำหรับ login และโหลด/แก้ไขภายหลัง */
  lineUserId?: string;
  lineDisplayName?: string;
  /** กลุ่ม (จาก API feedback?all=true) ใช้สำหรับ filter ใน Dashboard */
  groupNumber?: number;
  meta?: { area?: string; name?: string };
};
