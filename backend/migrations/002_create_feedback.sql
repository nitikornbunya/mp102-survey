-- ตารางคำตอบแบบฟอร์มรับฟังความคิดเห็น (ช่วงที่ 1 + ช่วงที่ 2 ตามฐาน)
CREATE TABLE IF NOT EXISTS feedback (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id      VARCHAR(255) NOT NULL UNIQUE,
  line_display_name VARCHAR(255),
  phase1            JSONB NOT NULL DEFAULT '{}',
  phase2            JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_line_user_id ON feedback (line_user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback (created_at);

COMMENT ON TABLE feedback IS 'คำตอบแบบฟอร์มรับฟังความคิดเห็น (phase1: q1,q2,q3 / phase2: base1,base2,base3,base4)';
COMMENT ON COLUMN feedback.phase1 IS 'คำตอบช่วงที่ 1: { q1, q2, q3 }';
COMMENT ON COLUMN feedback.phase2 IS 'คำตอบช่วงที่ 2: { base1: { questionId: answer }, base2, base3, base4 }';
