/**
 * Storage layer: ใช้ไฟล์ในโฟลเดอร์ data เมื่อรัน local
 * ใช้ Upstash Redis เมื่อ deploy บน Vercel (มี UPSTASH_REDIS_REST_URL)
 */
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import type { FeedbackPayload } from "@/lib/types";
import type { RegistrationPayload } from "@/lib/registration-types";

const DATA_DIR = path.join(process.cwd(), "data");
const FEEDBACK_FILE = path.join(DATA_DIR, "feedback.json");
const REG_FILE = path.join(DATA_DIR, "registrations.json");

const REDIS_FEEDBACK_KEY = "mp-pple:feedback";
const REDIS_REG_KEY = "mp-pple:registrations";

function useRedis(): boolean {
  return typeof process.env.UPSTASH_REDIS_REST_URL === "string" && process.env.UPSTASH_REDIS_REST_URL.length > 0;
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
  if (useRedis()) {
    const { Redis } = await import("@upstash/redis");
    const redis = Redis.fromEnv();
    const raw = await redis.get<string>(REDIS_FEEDBACK_KEY);
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
  if (useRedis()) {
    const { Redis } = await import("@upstash/redis");
    const redis = Redis.fromEnv();
    await redis.set(REDIS_FEEDBACK_KEY, JSON.stringify(list));
    return;
  }
  await ensureDataDir();
  await writeFile(FEEDBACK_FILE, JSON.stringify(list, null, 2), "utf-8");
}

// --- Registrations ---

export async function getRegistrationList(): Promise<RegistrationPayload[]> {
  if (useRedis()) {
    const { Redis } = await import("@upstash/redis");
    const redis = Redis.fromEnv();
    const raw = await redis.get<string>(REDIS_REG_KEY);
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
  if (useRedis()) {
    const { Redis } = await import("@upstash/redis");
    const redis = Redis.fromEnv();
    await redis.set(REDIS_REG_KEY, JSON.stringify(list));
    return;
  }
  await ensureDataDir();
  await writeFile(REG_FILE, JSON.stringify(list, null, 2), "utf-8");
}
