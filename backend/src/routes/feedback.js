import { Router } from "express";
import pool from "../db.js";

const router = Router();

function rowToFeedback(row) {
  const out = {
    id: row.id,
    lineUserId: row.line_user_id,
    lineDisplayName: row.line_display_name ?? undefined,
    groupNumber: row.group_number ?? undefined,
    phase1: row.phase1 ?? {},
    phase2: row.phase2 ?? {},
    createdAt: row.created_at?.toISOString?.() ?? row.created_at,
    updatedAt: row.updated_at?.toISOString?.() ?? row.updated_at,
  };
  if (row.full_name != null) out.fullName = row.full_name;
  if (row.role != null) out.role = row.role;
  if (row.province_id != null) out.provinceId = row.province_id;
  if (row.district_id != null) out.districtId = row.district_id;
  if (row.province != null) out.province = row.province;
  return out;
}

// GET /api/feedback
// - ?all=true — คืน feedback ทั้งหมด (สำหรับ Dashboard)
// - ?lineUserId=xxx — ดึง feedback ตาม LINE user เท่านั้น (ไม่คืน list)
router.get("/", async (req, res) => {
  try {
    const { lineUserId, all } = req.query;
    if (all === "true") {
      const { rows } = await pool.query(`
        SELECT f.*,
          r.group_number, r.full_name, r.role,
          r.province_id, r.district_id, r.province
        FROM feedback f
        LEFT JOIN registrations r ON f.line_user_id = r.line_user_id
        ORDER BY f.created_at ASC
      `);
      return res.json(rows.map(rowToFeedback));
    }
    if (!lineUserId) {
      return res.status(400).json({ error: "ต้องส่ง lineUserId หรือ all=true" });
    }
    const { rows } = await pool.query(
      "SELECT * FROM feedback WHERE line_user_id = $1",
      [lineUserId]
    );
    if (rows.length === 0) return res.status(404).json({ error: "ไม่พบข้อมูล" });
    return res.json(rowToFeedback(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เกิดข้อผิดพลาด" });
  }
});

// POST /api/feedback — สร้าง feedback (ส่ง phase1 ครั้งแรก)
router.post("/", async (req, res) => {
  try {
    const { lineUserId, lineDisplayName, phase1 } = req.body;
    if (!lineUserId || !phase1 || typeof phase1 !== "object") {
      return res.status(400).json({ error: "ต้องส่ง lineUserId และ phase1" });
    }
    const { rows } = await pool.query(
      `INSERT INTO feedback (line_user_id, line_display_name, phase1)
       VALUES ($1, $2, $3::jsonb)
       ON CONFLICT (line_user_id) DO UPDATE SET
         line_display_name = EXCLUDED.line_display_name,
         phase1 = EXCLUDED.phase1,
         updated_at = NOW()
       RETURNING *`,
      [lineUserId, lineDisplayName ?? null, JSON.stringify(phase1)]
    );
    res.status(201).json(rowToFeedback(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เกิดข้อผิดพลาด" });
  }
});

// PATCH /api/feedback — อัปเดต phase1 หรือ phase2 (ส่ง id + lineUserId)
router.patch("/", async (req, res) => {
  try {
    const { id, lineUserId, phase1, phase2 } = req.body;
    if (!id || !lineUserId) {
      return res.status(400).json({ error: "ต้องส่ง id และ lineUserId" });
    }
    const updates = [];
    const values = [id, lineUserId];
    let idx = 3;
    if (phase1 && typeof phase1 === "object") {
      updates.push(`phase1 = $${idx}::jsonb`);
      values.push(JSON.stringify(phase1));
      idx++;
    }
    if (phase2 && typeof phase2 === "object") {
      updates.push(`phase2 = COALESCE(feedback.phase2, '{}'::jsonb) || $${idx}::jsonb`);
      values.push(JSON.stringify(phase2));
      idx++;
    }
    if (updates.length === 0) {
      return res.status(400).json({ error: "ต้องส่ง phase1 หรือ phase2 เพื่ออัปเดต" });
    }
    const sql = `
      UPDATE feedback
      SET ${updates.join(", ")}, updated_at = NOW()
      WHERE id = $1 AND line_user_id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(sql, values);
    if (rows.length === 0) {
      return res.status(404).json({ error: "ไม่พบ feedback หรือ lineUserId ไม่ตรง" });
    }
    res.json(rowToFeedback(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เกิดข้อผิดพลาด" });
  }
});

export default router;
