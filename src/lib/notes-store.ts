/**
 * Где живут заметки на полях: в Redis — один hash `notes` (id → JSON),
 * локально — `.data/notes.json`. Подробности про выбор хранилища — в kv.ts.
 */
import type { Note } from "@/lib/notes-rules";
import { REDIS_ENABLED, readJson, redis, writeJson } from "@/lib/kv";

export { StoreUnavailable } from "@/lib/kv";

const KEY = "notes";

interface Store {
  all(): Promise<Note[]>;
  put(note: Note): Promise<void>;
  remove(id: string): Promise<void>;
}

// ─────────────────────────────── Redis ───────────────────────────────

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

const readFile = () => readJson<Record<string, Note>>(KEY, {});
const writeFile = (data: Record<string, Note>) => writeJson(KEY, data);

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

export const notesStore: Store = REDIS_ENABLED ? redisStore : fileStore;

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
