import { NextResponse } from "next/server";
import type { RegistrationPayload, RoleKey } from "@/lib/registration-types";
import { getRegistrationList, setRegistrationList } from "@/lib/storage";

/** POST: ลงทะเบียน (สร้างใหม่หรืออัปเดตตาม lineUserId) */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Omit<RegistrationPayload, "createdAt" | "updatedAt"> & {
      fullName: string;
      role: RoleKey;
      groupNumber: number;
      provinceId?: string;
      districtId?: string;
      province?: string;
    };
    const {
      lineUserId,
      lineDisplayName,
      fullName,
      role,
      provinceId,
      districtId,
      province,
      groupNumber,
    } = body;

    if (!lineUserId || !fullName || !role) {
      return NextResponse.json(
        { error: "ต้องส่ง lineUserId, fullName, role" },
        { status: 400 }
      );
    }
    const num = Number(groupNumber);
    if (!Number.isInteger(num) || num < 1 || num > 30) {
      return NextResponse.json(
        { error: "กลุ่มต้องเป็นเลข 1-30" },
        { status: 400 }
      );
    }

    const list = await getRegistrationList();
    const now = new Date().toISOString();
    const existingIndex = list.findIndex((r) => r.lineUserId === lineUserId);

    const payload: RegistrationPayload = {
      lineUserId,
      lineDisplayName,
      fullName,
      role,
      provinceId: role === "mp_constituency" ? provinceId : undefined,
      districtId: role === "mp_constituency" ? districtId : undefined,
      province: role === "provincial_team" ? province : undefined,
      groupNumber: num,
      createdAt: existingIndex >= 0 ? list[existingIndex].createdAt : now,
      updatedAt: now,
    };

    if (existingIndex >= 0) {
      list[existingIndex] = payload;
    } else {
      list.push(payload);
    }

    await setRegistrationList(list);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการบันทึก" },
      { status: 500 }
    );
  }
}

/** GET ?lineUserId=xxx (หนึ่งคน) หรือ GET ไม่มี query (ทั้งหมด สำหรับ dashboard) */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lineUserId = searchParams.get("lineUserId");
    const list = await getRegistrationList();

    if (lineUserId) {
      const one = list.find((r) => r.lineUserId === lineUserId);
      if (!one) return NextResponse.json(null);
      return NextResponse.json(one);
    }

    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการโหลด" },
      { status: 500 }
    );
  }
}
