import { Router } from "express";
import pool from "../db.js";

const router = Router();

function rowToRegistration(row) {
  return {
    lineUserId: row.line_user_id,
    lineDisplayName: row.line_display_name ?? undefined,
    fullName: row.full_name,
    role: row.role,
    provinceId: row.province_id ?? undefined,
    districtId: row.district_id ?? undefined,
    province: row.province ?? undefined,
    groupNumber: row.group_number,
    createdAt: row.created_at?.toISOString?.() ?? row.created_at,
    updatedAt: row.updated_at?.toISOString?.() ?? row.updated_at,
  };
}

// GET /api/registration?lineUserId=xxx — ค้นหาตาม LINE user เท่านั้น (ไม่คืน list)
router.get("/", async (req, res) => {
  try {
    const { lineUserId } = req.query;
    if (!lineUserId) {
      return res.status(400).json({ error: "ต้องส่ง lineUserId" });
    }
    const { rows } = await pool.query(
      "SELECT * FROM registrations WHERE line_user_id = $1",
      [lineUserId]
    );
    if (rows.length === 0) return res.status(404).json({ error: "ไม่พบข้อมูล" });
    return res.json(rowToRegistration(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เกิดข้อผิดพลาด" });
  }
});

// POST /api/registration — สร้าง/ลงทะเบียน
router.post("/", async (req, res) => {
  try {
    const {
      lineUserId,
      lineDisplayName,
      fullName,
      role,
      provinceId,
      districtId,
      province,
      groupNumber,
    } = req.body;
    if (!lineUserId || !fullName || !role || groupNumber == null) {
      return res.status(400).json({ error: "ข้อมูลไม่ครบ (lineUserId, fullName, role, groupNumber)" });
    }
    const num = Number(groupNumber);
    if (!Number.isInteger(num) || num < 1 || num > 40) {
      return res.status(400).json({ error: "groupNumber ต้องอยู่ระหว่าง 1-40" });
    }
    const { rows } = await pool.query(
      `INSERT INTO registrations (
        line_user_id, line_display_name, full_name, role,
        province_id, district_id, province, group_number
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (line_user_id) DO UPDATE SET
        line_display_name = EXCLUDED.line_display_name,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        province_id = EXCLUDED.province_id,
        district_id = EXCLUDED.district_id,
        province = EXCLUDED.province,
        group_number = EXCLUDED.group_number,
        updated_at = NOW()
      RETURNING *`,
      [
        lineUserId,
        lineDisplayName ?? null,
        fullName,
        role,
        provinceId ?? null,
        districtId ?? null,
        province ?? null,
        num,
      ]
    );
    res.status(201).json(rowToRegistration(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เกิดข้อผิดพลาด" });
  }
});

export default router;
