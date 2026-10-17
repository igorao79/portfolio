/**
 * Где живут заметки на полях.
 *
 * На проде — Redis по REST (Upstash или Vercel KV, у них один протокол): у
 * серверлесс-функции нет своего диска, а держать ради пары сотен заметок
 * отдельную БД с пулом соединений незачем. Все заметки лежат в одном hash
 * `notes`: id → JSON.
 *
 * Без переменных окружения — JSON-файл в `.data/`, чтобы локально всё
 * работало из коробки. На Vercel файл записать не выйдет, и API честно
 * ответит, что хранилище не настроено.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Note } from "@/lib/notes-rules";

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
const KEY = "notes";

export class StoreUnavailable extends Error {}

interface Store {
  all(): Promise<Note[]>;
  put(note: Note): Promise<void>;
  remove(id: string): Promise<void>;
}

// ─────────────────────────────── Redis ───────────────────────────────

async function redis<T>(command: (string | number)[]): Promise<T> {
  const res = await fetch(REDIS_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => null)) as { result?: T; error?: string } | null;
  if (!res.ok || !data || data.error) {
    throw new StoreUnavailable(data?.error ?? `redis: HTTP ${res.status}`);
  }
  return data.result as T;
}

const redisStore: Store = {
  async all() {
    // HGETALL по REST приходит плоским массивом: [поле, значение, поле, …].
    const flat = await redis<string[]>(["HGETALL", KEY]);
    const notes: Note[] = [];
    for (let i = 1; i < flat.length; i += 2) {
      try {
        notes.push(JSON.parse(flat[i]) as Note);
      } catch {
        // битую запись просто пропускаем
      }
    }
    return notes;
  },
  async put(note) {
    await redis(["HSET", KEY, note.id, JSON.stringify(note)]);
  },
  async remove(id) {
    await redis(["HDEL", KEY, id]);
  },
};

// ──────────────────────────────── файл ───────────────────────────────

const FILE = path.join(process.cwd(), ".data", "notes.json");

async function readFile(): Promise<Record<string, Note>> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Record<string, Note>;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw new StoreUnavailable(String(e));
  }
}

async function writeFile(data: Record<string, Note>): Promise<void> {
  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    throw new StoreUnavailable(String(e));
  }
}

const fileStore: Store = {
  async all() {
    return Object.values(await readFile());
  },
  async put(note) {
    const data = await readFile();
    data[note.id] = note;
    await writeFile(data);
  },
  async remove(id) {
    const data = await readFile();
    delete data[id];
    await writeFile(data);
  },
};

export const notesStore: Store = REDIS_URL && REDIS_TOKEN ? redisStore : fileStore;

/**
 * Кто может снимать любые заметки: usernames или sub через запятую в
 * NOTES_ADMINS. Сравниваем без учёта регистра и без «@».
 */
const ADMINS = (process.env.NOTES_ADMINS ?? "")
  .split(",")
  .map((s) => s.trim().replace(/^@/, "").toLowerCase())
  .filter(Boolean);

export function isNotesAdmin(user: { sub: string; username: string | null }): boolean {
  return (
    ADMINS.includes(user.sub.toLowerCase()) ||
    (!!user.username && ADMINS.includes(user.username.toLowerCase()))
  );
}
