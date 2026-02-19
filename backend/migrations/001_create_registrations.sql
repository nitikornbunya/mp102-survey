-- ตารางลงทะเบียนผู้เข้าร่วม (LINE user + บทบาท + จังหวัด/เขต + กลุ่ม)
CREATE TABLE IF NOT EXISTS registrations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id      VARCHAR(255) NOT NULL UNIQUE,
  line_display_name VARCHAR(255),
  full_name         VARCHAR(255) NOT NULL,
  role              VARCHAR(50) NOT NULL,
  province_id       VARCHAR(100),
  district_id       INTEGER,
  province          VARCHAR(100),
  group_number      INTEGER NOT NULL CHECK (group_number >= 1 AND group_number <= 40),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registrations_line_user_id ON registrations (line_user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_role ON registrations (role);
CREATE INDEX IF NOT EXISTS idx_registrations_group_number ON registrations (group_number);

COMMENT ON TABLE registrations IS 'ลงทะเบียนผู้เข้าร่วม workshop (สส.เขต / สส.บัญชีรายชื่อ / ทีมจังหวัด)';
COMMENT ON COLUMN registrations.province_id IS 'ชื่อจังหวัดภาษาไทย (สำหรับ สส.เขต)';
COMMENT ON COLUMN registrations.district_id IS 'เลขเขตเลือกตั้ง (สำหรับ สส.เขต)';
COMMENT ON COLUMN registrations.province IS 'ชื่อจังหวัด (สำหรับ ทีมจังหวัด)';
COMMENT ON COLUMN registrations.group_number IS 'กลุ่มที่อยู่ ในงานสัมมนา 1-30';
