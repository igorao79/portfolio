/**
 * Общее хранилище для живых данных сайта — заметок и реакций.
 *
 * На проде — Redis по REST (Upstash или Vercel KV, у них один протокол): у
 * серверлесс-функции нет своего диска, а держать ради пары сотен записей
 * отдельную БД с пулом соединений незачем.
 *
 * Без переменных окружения — JSON-файлы в `.data/`, чтобы локально всё
 * работало из коробки. На Vercel файл записать не выйдет, и API честно
 * ответит, что хранилище не настроено.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";

export const REDIS_ENABLED = Boolean(REDIS_URL && REDIS_TOKEN);

export class StoreUnavailable extends Error {}

type Command = (string | number)[];

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => null)) as T | { error?: string } | null;
  if (!res.ok || !data || (typeof data === "object" && "error" in data && data.error)) {
    const message = data && typeof data === "object" && "error" in data ? data.error : null;
    throw new StoreUnavailable(message ?? `redis: HTTP ${res.status}`);
  }
  return data as T;
}

export async function redis<T>(command: Command): Promise<T> {
  const data = await post<{ result: T }>(REDIS_URL, command);
  return data.result;
}

/** Несколько команд одним запросом — у REST-Redis это /pipeline. */
export async function redisPipeline<T>(commands: Command[]): Promise<T[]> {
  if (commands.length === 0) return [];
  const data = await post<{ result?: T; error?: string }[]>(`${REDIS_URL.replace(/\/+$/, "")}/pipeline`, commands);
  return data.map((r) => {
    if (r.error) throw new StoreUnavailable(r.error);
    return r.result as T;
  });
}

// ──────────────────────────────── файл ───────────────────────────────

const fileOf = (name: string) => path.join(process.cwd(), ".data", `${name}.json`);

export async function readJson<T>(name: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(fileOf(name), "utf8")) as T;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw new StoreUnavailable(String(e));
  }
}

export async function writeJson(name: string, data: unknown): Promise<void> {
  try {
    await fs.mkdir(path.dirname(fileOf(name)), { recursive: true });
    await fs.writeFile(fileOf(name), JSON.stringify(data, null, 2));
  } catch (e) {
    throw new StoreUnavailable(String(e));
  }
}
