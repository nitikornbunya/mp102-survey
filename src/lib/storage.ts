/**
 * Storage layer: ใช้ไฟล์ในโฟลเดอร์ data เมื่อรัน local
 * ใช้ Vercel KV เมื่อ deploy บน Vercel (มี KV_REST_API_URL)
 */
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import type { FeedbackPayload } from "@/lib/types";
import type { RegistrationPayload } from "@/lib/registration-types";

const DATA_DIR = path.join(process.cwd(), "data");
const FEEDBACK_FILE = path.join(DATA_DIR, "feedback.json");
const REG_FILE = path.join(DATA_DIR, "registrations.json");

const KV_FEEDBACK_KEY = "mp-pple:feedback";
const KV_REG_KEY = "mp-pple:registrations";

function useKv(): boolean {
  return typeof process.env.KV_REST_API_URL === "string" && process.env.KV_REST_API_URL.length > 0;
}

async function ensureDataDir() {
  try {
    await mkdir(DATA_DIR, { recursive: true });
  } catch {
    // already exists
  }
}

// --- Feedback ---

export async function getFeedbackList(): Promise<FeedbackPayload[]> {
  if (useKv()) {
    const { kv } = await import("@vercel/kv");
    const raw = await kv.get<string>(KV_FEEDBACK_KEY);
    if (raw == null) return [];
    try {
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }
  await ensureDataDir();
  try {
    const raw = await readFile(FEEDBACK_FILE, "utf-8");
    const data = JSON.parse(raw) as FeedbackPayload[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function setFeedbackList(list: FeedbackPayload[]): Promise<void> {
  if (useKv()) {
    const { kv } = await import("@vercel/kv");
    await kv.set(KV_FEEDBACK_KEY, JSON.stringify(list));
    return;
  }
  await ensureDataDir();
  await writeFile(FEEDBACK_FILE, JSON.stringify(list, null, 2), "utf-8");
}

// --- Registrations ---

export async function getRegistrationList(): Promise<RegistrationPayload[]> {
  if (useKv()) {
    const { kv } = await import("@vercel/kv");
    const raw = await kv.get<string>(KV_REG_KEY);
    if (raw == null) return [];
    try {
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }
  await ensureDataDir();
  try {
    const raw = await readFile(REG_FILE, "utf-8");
    const data = JSON.parse(raw) as RegistrationPayload[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function setRegistrationList(list: RegistrationPayload[]): Promise<void> {
  if (useKv()) {
    const { kv } = await import("@vercel/kv");
    await kv.set(KV_REG_KEY, JSON.stringify(list));
    return;
  }
  await ensureDataDir();
  await writeFile(REG_FILE, JSON.stringify(list, null, 2), "utf-8");
}
