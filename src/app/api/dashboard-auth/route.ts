import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "dashboard_access";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 ชั่วโมง

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const password = typeof body?.password === "string" ? body.password : "";
    const expected = process.env.DASHBOARD_PASSWORD ?? "";

    if (!expected) {
      return NextResponse.json(
        { error: "ไม่ได้ตั้งค่ารหัสผ่าน Dashboard" },
        { status: 500 }
      );
    }

    if (password !== expected) {
      return NextResponse.json({ error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/dashboard",
      maxAge: COOKIE_MAX_AGE,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
