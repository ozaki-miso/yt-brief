import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (_redis) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Upstash Redis env vars not set");
  _redis = new Redis({ url, token });
  return _redis;
}

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  thumbnailUrl: string | null;
  takeaway: string | null;
  points: { heading: string; body: string }[];
  createdAt: string;
}

const HISTORY_MAX = 30;

export async function saveHistory(userId: string, item: Omit<HistoryItem, "id" | "createdAt">) {
  const redis = getRedis();
  const key = `history:${userId}`;
  const entry: HistoryItem = {
    ...item,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  await redis.lpush(key, JSON.stringify(entry));
  await redis.ltrim(key, 0, HISTORY_MAX - 1);
}

export async function getHistory(userId: string): Promise<HistoryItem[]> {
  const redis = getRedis();
  const key = `history:${userId}`;
  const items = await redis.lrange<string>(key, 0, -1);
  return items.map((item) => (typeof item === "string" ? JSON.parse(item) : item) as HistoryItem);
}

export async function deleteHistoryItem(userId: string, id: string): Promise<void> {
  const redis = getRedis();
  const key = `history:${userId}`;
  const items = await redis.lrange<string>(key, 0, -1);
  const parsed = items.map((item) => (typeof item === "string" ? JSON.parse(item) : item) as HistoryItem);
  const target = parsed.find((h) => h.id === id);
  if (!target) return;
  await redis.lrem(key, 1, JSON.stringify(target));
}
