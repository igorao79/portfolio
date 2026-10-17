/**
 * Правила заметок на полях — общие для клиента и сервера. Клиент проверяет
 * ими ввод на лету, сервер — повторно, потому что запрос можно собрать и
 * руками.
 */

export const NOTE_MAX_CHARS = 120;
export const NOTE_MAX_LINES = 4;
/** Сколько заметок может висеть у одного аккаунта одновременно. */
export const NOTES_PER_USER = 3;
/** Общий потолок, чтобы поля не превратились в забор. */
export const NOTES_TOTAL = 200;
/** Пауза между новыми заметками одного аккаунта. */
export const NOTE_COOLDOWN_MS = 30_000;

/** Секции, к которым можно привязать заметку (id у <section>). */
export const NOTE_SECTIONS = ["home", "about", "projects", "contacts"] as const;
export type NoteSection = (typeof NOTE_SECTIONS)[number];

export interface Note {
  id: string;
  /** sub аккаунта Звоночка — по нему решается, чья заметка. */
  sub: string;
  name: string | null;
  username: string | null;
  text: string;
  /** Секция-якорь: при другой ширине экрана секции едут, а заметка с ними. */
  section: NoteSection;
  /** Левый край заметки относительно центра страницы, px. */
  x: number;
  /** Верх заметки относительно верха секции, px. */
  y: number;
  createdAt: number;
}

/** То, что отдаётся наружу: sub чужих заметок посетителям ни к чему. */
export type PublicNote = Omit<Note, "sub"> & { mine: boolean };

/**
 * Ловим ссылки, но не названия технологий: «Next.js» или «Node.js» — это
 * не домен, и на портфолио разработчика их будут писать постоянно. Поэтому
 * домен считается ссылкой только с узнаваемым TLD, а «.js» в списке нет.
 */
const TLDS = [
  "com", "ru", "net", "org", "io", "me", "xyz", "app", "dev", "online", "site",
  "info", "su", "co", "gg", "ly", "link", "to", "tv", "cc", "top", "pro",
  "store", "shop", "biz", "us", "uk", "de", "by", "kz", "ua", "eu", "fun",
  "space", "club", "live", "tech", "website", "page", "art", "lol", "ai", "is",
].join("|");

const LINK_PATTERNS = [
  /[a-z][a-z0-9+.-]*:\/\//i, // любая схема: http://, tg://, ftp://
  /\bwww\./i,
  /\bt\.me\b/i,
  // Конец TLD — там, где кончается его алфавит: «site.xyzПривет» — это всё
  // ещё ссылка, приклеенная к слову, а «config.toml» — уже нет.
  new RegExp(`[\\p{L}\\p{N}-]+\\s*\\.\\s*(?:${TLDS})(?![a-z0-9])`, "iu"),
  /[\p{L}\p{N}-]+\s*\.\s*(?:рф|рус)(?![а-яё0-9])/iu,
  /\b(?:mailto|tel|javascript|data):/i,
];

export function containsLink(text: string): boolean {
  return LINK_PATTERNS.some((re) => re.test(text));
}

/** Приводит текст к виду, в котором он хранится. */
export function normalizeNoteText(raw: string): string {
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/[\t ]+/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

export type NoteTextProblem = "empty" | "tooLong" | "tooManyLines" | "link";

export function noteTextProblem(text: string): NoteTextProblem | null {
  if (!text) return "empty";
  if ([...text].length > NOTE_MAX_CHARS) return "tooLong";
  if (text.split("\n").length > NOTE_MAX_LINES) return "tooManyLines";
  if (containsLink(text)) return "link";
  return null;
}

export function isNoteSection(v: unknown): v is NoteSection {
  return typeof v === "string" && (NOTE_SECTIONS as readonly string[]).includes(v);
}

/** Координаты — с запасом под любой экран, но без мусора вроде 1e308. */
export function isValidOffset(x: unknown, y: unknown): x is number {
  return (
    typeof x === "number" &&
    typeof y === "number" &&
    Number.isFinite(x) &&
    Number.isFinite(y) &&
    Math.abs(x) <= 4000 &&
    y >= 0 &&
    y <= 20000
  );
}
