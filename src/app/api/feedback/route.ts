import { NextResponse } from "next/server";
import type { FeedbackPayload, Phase2Answers } from "@/lib/types";
import { getFeedbackList, setFeedbackList } from "@/lib/storage";
import { randomUUID } from "crypto";

function emptyPhase2(): Phase2Answers {
  return { base1: {}, base2: {}, base3: {}, base4: {} };
}

/** สร้างรายการใหม่ หรืออัปเดตถ้ามี lineUserId อยู่แล้ว (หนึ่งรายการต่อ LINE user) */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<Omit<FeedbackPayload, "id" | "createdAt">> & { lineUserId?: string; lineDisplayName?: string };
    const { phase1, phase2, meta, lineUserId, lineDisplayName } = body;

    if (!phase1) {
      return NextResponse.json(
        { error: "ต้องส่ง phase1" },
        { status: 400 }
      );
    }
    if (!lineUserId) {
      return NextResponse.json(
        { error: "ต้องส่ง lineUserId (กรุณาเข้าสู่ระบบด้วย LINE)" },
        { status: 400 }
      );
    }

    const list = await getFeedbackList();
    const existingIndex = list.findIndex((item) => item.lineUserId === lineUserId);

    if (existingIndex >= 0) {
      const existing = list[existingIndex];
      existing.phase1 = phase1;
      if (phase2) existing.phase2 = phase2;
      if (lineDisplayName) existing.lineDisplayName = lineDisplayName;
      existing.updatedAt = new Date().toISOString();
      await setFeedbackList(list);
      return NextResponse.json({ ok: true, id: existing.id });
    }

    const payload: FeedbackPayload = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      phase1,
      phase2: phase2 ?? emptyPhase2(),
      meta,
      lineUserId,
      lineDisplayName,
    };

    list.push(payload);
    await setFeedbackList(list);

    return NextResponse.json({ ok: true, id: payload.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการบันทึก" },
      { status: 500 }
    );
  }
}

/** อัปเดตบางส่วน (phase1 และ/หรือ phase2) ต้องส่ง lineUserId และตรวจว่าเป็นเจ้าของ */
export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      id: string;
      lineUserId: string;
      phase1?: FeedbackPayload["phase1"];
      phase2?: Partial<Phase2Answers>;
    };
    const { id, lineUserId, phase1, phase2 } = body;

    if (!id || !lineUserId) {
      return NextResponse.json({ error: "ต้องส่ง id และ lineUserId" }, { status: 400 });
    }

    const list = await getFeedbackList();
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "ไม่พบรายการนี้" }, { status: 404 });
    }

    const current = list[index];
    if (current.lineUserId !== lineUserId) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์แก้ไขรายการนี้" }, { status: 403 });
    }

    if (phase1) current.phase1 = phase1;
    if (phase2) {
      current.phase2 = {
        ...current.phase2,
        ...phase2,
      };
    }
    (current as FeedbackPayload & { updatedAt?: string }).updatedAt = new Date().toISOString();

    await setFeedbackList(list);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัปเดต" },
      { status: 500 }
    );
  }
}

/** GET ทั้งหมด, GET by id (?id=xxx), หรือ GET by lineUserId (?lineUserId=xxx) */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const lineUserId = searchParams.get("lineUserId");
    const list = await getFeedbackList();

    if (lineUserId) {
      const one = list.find((item) => item.lineUserId === lineUserId);
      if (!one) return NextResponse.json(null);
      return NextResponse.json(one);
    }
    if (id) {
      const one = list.find((item) => item.id === id);
      if (!one) return NextResponse.json({ error: "ไม่พบรายการนี้" }, { status: 404 });
      return NextResponse.json(one);
    }

    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการโหลดข้อมูล" },
      { status: 500 }
    );
  }
}
