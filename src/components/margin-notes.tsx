"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useApp } from "@/context/app-context";
import type { useZvonokAuth } from "@/hooks/use-zvonok-auth";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  NOTES_PER_USER,
  NOTE_MAX_CHARS,
  NOTE_SECTIONS,
  normalizeNoteText,
  noteTextProblem,
} from "@/lib/notes-rules";
import type { NoteSection, PublicNote } from "@/lib/notes-rules";

/**
 * Заметки на полях. Вошедший через Звоночек может повесить короткую
 * заметку в пустое место страницы — по бокам от колонки с контентом — и
 * потом перетащить её, куда захочет. Видят их все.
 *
 * Пустое место не размечено заранее: раскладка у секций разная (колонка
 * про себя уже, чем проекты), а на другом экране всё едет. Поэтому каждый
 * раз меряем, где сейчас лежит контент, и считаем свободным всё, что с ним
 * не пересекается. Заметка, которой на этом экране места не нашлось
 * (узкое окно, мобилка), просто не рисуется.
 */

type Auth = ReturnType<typeof useZvonokAuth>;

/** Событие из карточки профиля: «хочу повесить заметку». */
export const PLACE_NOTE_EVENT = "notes:place";

const NOTE_W = 184;
/** Высота «призрака» при выборе места — примерно как у заметки в 2–3 строки. */
const GHOST_H = 84;
/** Отступ, который заметка держит от контента и краёв. */
const GAP = 12;
/** Ниже этой ширины полей не остаётся ни в одной секции. */
const MIN_WIDE = 1024;

const TEXT = {
  ru: {
    placeHint: "Кликни по свободному месту на полях",
    escHint: "Esc — отмена",
    placeholder: "Пара слов на полях…",
    save: "Повесить",
    cancel: "Отмена",
    remove: "Убрать заметку",
    narrow: "Заметки живут на полях — открой сайт на широком экране",
    problems: {
      empty: "Напиши хоть что-нибудь",
      tooLong: `Не больше ${NOTE_MAX_CHARS} символов`,
      tooManyLines: "Не больше 4 строк",
      link: "Ссылки оставлять нельзя",
      position: "Здесь заметке не место",
      limit: `У тебя уже ${NOTES_PER_USER} заметки — убери одну, чтобы повесить новую`,
      cooldown: "Не так быстро — подожди полминуты",
      full: "Поля заполнены, места больше нет",
      storage: "Хранилище заметок сейчас недоступно",
      auth: "Сначала войди через Звоночек",
      forbidden: "Это не твоя заметка",
      missing: "Этой заметки уже нет",
      network: "Не получилось — проверь соединение",
    },
  },
  en: {
    placeHint: "Click any free spot in the margins",
    escHint: "Esc to cancel",
    placeholder: "A few words in the margin…",
    save: "Pin it",
    cancel: "Cancel",
    remove: "Remove note",
    narrow: "Notes live in the margins — open the site on a wider screen",
    problems: {
      empty: "Write something first",
      tooLong: `${NOTE_MAX_CHARS} characters max`,
      tooManyLines: "4 lines max",
      link: "Links aren't allowed",
      position: "A note can't go here",
      limit: `You already have ${NOTES_PER_USER} notes — remove one to pin another`,
      cooldown: "Not so fast — wait half a minute",
      full: "The margins are full",
      storage: "Note storage is unavailable right now",
      auth: "Sign in with Zvonochek first",
      forbidden: "That's not your note",
      missing: "That note is already gone",
      network: "Didn't work — check your connection",
    },
  },
} as const;

type Problem = keyof (typeof TEXT)["ru"]["problems"];

// ────────────────────────────── геометрия ─────────────────────────────

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface Snapshot {
  width: number;
  height: number;
  center: number;
  sections: { id: NoteSection; top: number; bottom: number }[];
  /** Всё, на что заметке ложиться нельзя, в координатах документа. */
  blocks: Rect[];
}

const rectAt = (left: number, top: number, h: number): Rect => ({
  left,
  top,
  right: left + NOTE_W,
  bottom: top + h,
});

const overlaps = (a: Rect, b: Rect, pad = 0) =>
  a.left < b.right + pad && a.right > b.left - pad && a.top < b.bottom + pad && a.bottom > b.top - pad;

function docRect(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return {
    left: r.left + window.scrollX,
    top: r.top + window.scrollY,
    right: r.right + window.scrollX,
    bottom: r.bottom + window.scrollY,
  };
}

/** Меряет страницу как она есть сейчас. */
function measure(): Snapshot {
  const width = document.documentElement.clientWidth;
  const height = document.documentElement.scrollHeight;
  const sections: Snapshot["sections"] = [];
  const blocks: Rect[] = [];

  for (const id of NOTE_SECTIONS) {
    const section = document.getElementById(id);
    if (!section) continue;
    const r = docRect(section);
    sections.push({ id, top: r.top, bottom: r.bottom });
    // Контент секции — её прямые потомки: колонка, бегущая строка героя.
    // Модалки (fixed) лежат вне потока и полей не занимают.
    for (const child of Array.from(section.children)) {
      if (getComputedStyle(child).position === "fixed") continue;
      const cr = docRect(child);
      if (cr.right - cr.left > 0 && cr.bottom - cr.top > 0) blocks.push(cr);
    }
  }

  // Сайдбар прибит к правому краю вьюпорта — значит, во всю высоту.
  const aside = document.querySelector("aside");
  if (aside) {
    const r = aside.getBoundingClientRect();
    if (r.width > 0) blocks.push({ left: r.left, top: 0, right: width, bottom: height });
  }

  return { width, height, center: width / 2, sections, blocks };
}

function sectionAt(snap: Snapshot, y: number) {
  return snap.sections.find((s) => y >= s.top && y < s.bottom) ?? null;
}

/** Помещается ли прямоугольник на поля: не на контенте и не за краем. */
function fits(snap: Snapshot, rect: Rect, others: Rect[] = []): boolean {
  if (rect.left < GAP || rect.right > snap.width - GAP) return false;
  if (rect.top < GAP || rect.bottom > snap.height - GAP) return false;
  if (!sectionAt(snap, rect.top)) return false;
  if (snap.blocks.some((b) => overlaps(rect, b, GAP))) return false;
  return !others.some((o) => overlaps(rect, o, 4));
}

/** Привязка к секции: из координат документа — в то, что хранится. */
function anchor(snap: Snapshot, left: number, top: number) {
  const section = sectionAt(snap, top);
  if (!section) return null;
  return { section: section.id, x: Math.round(left - snap.center), y: Math.round(top - section.top) };
}

function place(snap: Snapshot, note: Pick<PublicNote, "section" | "x" | "y">) {
  const section = snap.sections.find((s) => s.id === note.section);
  return section ? { left: snap.center + note.x, top: section.top + note.y } : null;
}

/** Стабильный оттенок и наклон на заметку — чтобы поля не выглядели сеткой. */
function hashOf(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// ─────────────────────────────── API ─────────────────────────────────

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: init?.body ? { "Content-Type": "application/json" } : undefined,
    });
  } catch {
    throw new NoteError("network");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new NoteError((data.error as Problem) ?? "network");
  return data as T;
}

class NoteError extends Error {
  constructor(public code: Problem) {
    super(code);
  }
}

const problemOf = (e: unknown): Problem =>
  e instanceof NoteError && e.code in TEXT.ru.problems ? e.code : "network";

// ───────────────────────────── компонент ─────────────────────────────

const IDLE = { kind: "idle" } as const;
const noop = () => () => {};

type Mode =
  | { kind: "idle" }
  | { kind: "placing"; clientX: number; clientY: number }
  | { kind: "editing"; left: number; top: number };

interface Drag {
  id: string;
  dx: number;
  dy: number;
  left: number;
  top: number;
  startLeft: number;
  startTop: number;
  ok: boolean;
}

export function MarginNotes({ auth }: { auth: Auth }) {
  const { locale, loaded } = useApp();
  const tr = TEXT[locale];
  const { user } = auth;

  const [notes, setNotes] = useState<PublicNote[]>([]);
  const [admin, setAdmin] = useState(false);
  const [snap, setSnap] = useState<Snapshot | null>(null);
  /** Высоты заметок: без них не понять, влезает ли заметка на этом экране. */
  const [heights, setHeights] = useState<Record<string, number>>({});
  const [rawMode, setMode] = useState<Mode>(IDLE);
  // Вышли из аккаунта посреди дела — режим сам сворачивается.
  const mode = user ? rawMode : IDLE;
  const [drag, setDrag] = useState<Drag | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const noteEls = useRef(new Map<string, HTMLDivElement>());

  // Порталу нужен document — на сервере его нет.
  const mounted = useSyncExternalStore(noop, () => true, () => false);

  const say = useCallback((message: string) => {
    setToast(message);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(id);
  }, [toast]);

  // Список заново при входе и выходе: от этого зависит, какие заметки «мои».
  useEffect(() => {
    if (!auth.ready) return;
    api<{ notes: PublicNote[]; admin: boolean }>("/api/notes")
      .then((d) => {
        setNotes(d.notes);
        setAdmin(d.admin);
      })
      .catch(() => {});
  }, [auth.ready, user?.sub]);

  // ── замеры ──
  const remeasure = useCallback(() => {
    setSnap(measure());
    const next: Record<string, number> = {};
    noteEls.current.forEach((el, id) => (next[id] = el.offsetHeight));
    setHeights(next);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    // Таймер, а не requestAnimationFrame: замер — не анимация, а rAF в
    // свёрнутом или перекрытом окне может не прийти вовсе. Заодно серия
    // resize склеивается в один замер.
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(remeasure, 60);
    };
    schedule();
    // Анимации входа сдвигают блоки на десятки пикселей — перемеряем, когда
    // они отыграют.
    const late = setTimeout(schedule, 1200);
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    const main = document.querySelector("main");
    if (main) ro.observe(main);
    window.addEventListener("resize", schedule);
    return () => {
      clearTimeout(timer);
      clearTimeout(late);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [loaded, remeasure]);

  // Новые или изменённые заметки — перемерить их высоты, когда они отрисуются.
  useEffect(() => {
    const timer = setTimeout(remeasure, 0);
    return () => clearTimeout(timer);
  }, [notes, remeasure]);

  /** Где заметка стоит на этом экране, или null — если места ей нет. */
  const layoutOf = (note: PublicNote) => {
    if (!snap) return null;
    const pos = place(snap, note);
    if (!pos) return null;
    const rect = rectAt(pos.left, pos.top, heights[note.id] ?? GHOST_H);
    return fits(snap, rect) ? pos : null;
  };

  const otherRects = (exceptId?: string) => {
    if (!snap) return [];
    return notes.flatMap((n) => {
      if (n.id === exceptId) return [];
      const pos = layoutOf(n);
      return pos ? [rectAt(pos.left, pos.top, heights[n.id] ?? GHOST_H)] : [];
    });
  };

  // ── размещение ──
  useEffect(() => {
    const onPlace = () => {
      if (!user) return say(tr.problems.auth);
      if (window.innerWidth < MIN_WIDE) return say(tr.narrow);
      if (notes.filter((n) => n.mine).length >= NOTES_PER_USER) return say(tr.problems.limit);
      setSnap(measure());
      setMode({ kind: "placing", clientX: -1000, clientY: -1000 });
    };
    window.addEventListener(PLACE_NOTE_EVENT, onPlace);
    return () => window.removeEventListener(PLACE_NOTE_EVENT, onPlace);
  }, [user, notes, tr, say]);

  // Пока выбираем место, страница крутится — призраку нужен свежий scrollY.
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (mode.kind !== "placing") return;
    const onScroll = () => forceTick((t) => t + 1);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mode.kind]);

  useEffect(() => {
    if (mode.kind === "idle") return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMode(IDLE);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode.kind]);

  const ghost =
    mode.kind === "placing" && snap
      ? (() => {
          const left = mode.clientX + window.scrollX - NOTE_W / 2;
          const top = mode.clientY + window.scrollY - 18;
          return { left, top, ok: fits(snap, rectAt(left, top, GHOST_H), otherRects()) };
        })()
      : null;

  const create = async (text: string, left: number, top: number) => {
    const s = measure();
    const at = anchor(s, left, top);
    if (!at) throw new NoteError("position");
    const { note } = await api<{ note: PublicNote }>("/api/notes", {
      method: "POST",
      body: JSON.stringify({ text, ...at }),
    });
    setNotes((list) => [...list, note]);
    setMode(IDLE);
  };

  const remove = async (id: string) => {
    const prev = notes;
    setNotes((list) => list.filter((n) => n.id !== id));
    try {
      await api(`/api/notes/${id}`, { method: "DELETE" });
    } catch (e) {
      setNotes(prev);
      say(tr.problems[problemOf(e)]);
    }
  };

  // ── перетаскивание ──
  const onNoteDown = (note: PublicNote, e: ReactPointerEvent<HTMLDivElement>) => {
    if (!note.mine || e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button")) return;
    const pos = layoutOf(note);
    if (!pos) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setSnap(measure());
    setDrag({
      id: note.id,
      dx: e.pageX - pos.left,
      dy: e.pageY - pos.top,
      left: pos.left,
      top: pos.top,
      startLeft: pos.left,
      startTop: pos.top,
      ok: true,
    });
  };

  const onNoteMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag || !snap) return;
    const left = e.pageX - drag.dx;
    const top = e.pageY - drag.dy;
    const h = heights[drag.id] ?? GHOST_H;
    setDrag({ ...drag, left, top, ok: fits(snap, rectAt(left, top, h), otherRects(drag.id)) });
  };

  const onNoteUp = async () => {
    if (!drag) return;
    const d = drag;
    setDrag(null);
    const moved = Math.hypot(d.left - d.startLeft, d.top - d.startTop) > 3;
    if (!moved || !d.ok || !snap) return;
    const at = anchor(snap, d.left, d.top);
    if (!at) return;
    const prev = notes;
    setNotes((list) => list.map((n) => (n.id === d.id ? { ...n, ...at } : n)));
    try {
      await api(`/api/notes/${d.id}`, { method: "PATCH", body: JSON.stringify(at) });
    } catch (e) {
      setNotes(prev);
      say(tr.problems[problemOf(e)]);
    }
  };

  if (!mounted) return null;

  return (
    <>
      {/* Слой в координатах документа: предки статичны, так что absolute
          здесь отсчитывается от самого верха страницы и едет со скроллом. */}
      <div aria-label="Notes" className="pointer-events-none absolute left-0 top-0 z-30 w-full">
        {notes.map((note) => {
          const dragging = drag?.id === note.id;
          const pos = dragging ? { left: drag.left, top: drag.top } : layoutOf(note);
          return (
            <NoteCard
              key={note.id}
              note={note}
              locale={locale}
              ref={(el) => {
                if (el) noteEls.current.set(note.id, el);
                else noteEls.current.delete(note.id);
              }}
              left={pos?.left ?? 0}
              top={pos?.top ?? 0}
              hidden={!pos}
              dragging={dragging}
              invalid={dragging && !drag.ok}
              canRemove={note.mine || admin}
              onRemove={() => remove(note.id)}
              onPointerDown={(e) => onNoteDown(note, e)}
              onPointerMove={onNoteMove}
              onPointerUp={onNoteUp}
              onPointerCancel={() => setDrag(null)}
            />
          );
        })}

        {ghost && (
          <div
            className={cn(
              "absolute rounded-xl border-2 border-dashed transition-colors",
              ghost.ok ? "border-emerald-500/70 bg-emerald-500/10" : "border-destructive/60 bg-destructive/5"
            )}
            style={{ left: ghost.left, top: ghost.top, width: NOTE_W, height: GHOST_H }}
          />
        )}

        {mode.kind === "editing" && (
          <NoteEditor
            locale={locale}
            left={mode.left}
            top={mode.top}
            onCancel={() => setMode(IDLE)}
            onSubmit={(text) => create(text, mode.left, mode.top)}
          />
        )}
      </div>

      {createPortal(
        <>
          {/* Пока выбираем место — ловим клики поверх всей страницы, чтобы
              случайно не нажать ссылку или кнопку под курсором. */}
          {mode.kind === "placing" && (
            <div
              className="fixed inset-0 z-[60] cursor-crosshair"
              onPointerMove={(e) =>
                setMode({ kind: "placing", clientX: e.clientX, clientY: e.clientY })
              }
              onClick={(e) => {
                const left = e.clientX + window.scrollX - NOTE_W / 2;
                const top = e.clientY + window.scrollY - 18;
                const s = measure();
                if (!fits(s, rectAt(left, top, GHOST_H), otherRects())) {
                  say(tr.problems.position);
                  return;
                }
                setMode({ kind: "editing", left, top });
              }}
            />
          )}

          <AnimatePresence>
            {mode.kind === "placing" && (
              <motion.div
                key="hint"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="pointer-events-none fixed left-1/2 top-4 z-[61] -translate-x-1/2 rounded-full border border-border bg-card px-4 py-2 text-xs shadow-lg"
              >
                {tr.placeHint} <span className="text-muted-foreground">· {tr.escHint}</span>
              </motion.div>
            )}
            {toast && (
              <motion.div
                key="toast"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="fixed bottom-20 left-1/2 z-[61] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-full border border-border bg-card px-4 py-2 text-center text-xs shadow-lg md:bottom-6"
              >
                {toast}
              </motion.div>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}
    </>
  );
}

// ─────────────────────────────── заметка ─────────────────────────────

interface CardProps {
  note: PublicNote;
  locale: Locale;
  ref: (el: HTMLDivElement | null) => void;
  left: number;
  top: number;
  hidden: boolean;
  dragging: boolean;
  invalid: boolean;
  canRemove: boolean;
  onRemove: () => void;
  onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
}

function NoteCard({ note, locale, ref, left, top, hidden, dragging, invalid, canRemove, onRemove, ...handlers }: CardProps) {
  const seed = hashOf(note.id);
  const hue = seed % 360;
  const tilt = ((seed >> 3) % 5) - 2; // −2°…2°
  const author = note.username ? `@${note.username}` : note.name ?? "—";

  return (
    <div
      ref={ref}
      {...handlers}
      className={cn(
        "group absolute touch-none select-none rounded-xl border bg-card/90 p-3 pt-3.5 shadow-sm backdrop-blur-sm transition-[box-shadow,transform,border-color] duration-150",
        hidden ? "invisible" : "pointer-events-auto",
        note.mine ? "cursor-grab border-primary/30" : "border-border",
        dragging && "z-10 cursor-grabbing shadow-xl",
        invalid && "border-destructive"
      )}
      style={{
        left,
        top,
        width: NOTE_W,
        transform: `rotate(${dragging ? 0 : tilt}deg) scale(${dragging ? 1.03 : 1})`,
      }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-3 top-0 h-[3px] rounded-b-full"
        style={{ background: `hsl(${hue} 70% 60%)` }}
      />
      <p className="whitespace-pre-wrap break-words text-[13px] leading-snug">{note.text}</p>
      <p className="mt-1.5 truncate text-[11px] text-muted-foreground">{author}</p>
      {canRemove && (
        <button
          onClick={onRemove}
          aria-label={TEXT[locale].remove}
          title={TEXT[locale].remove}
          className="absolute -right-2 -top-2 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-muted-foreground opacity-0 shadow-sm transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

// ────────────────────────────── редактор ─────────────────────────────

function NoteEditor({
  locale,
  left,
  top,
  onCancel,
  onSubmit,
}: {
  locale: Locale;
  left: number;
  top: number;
  onCancel: () => void;
  onSubmit: (text: string) => Promise<void>;
}) {
  const tr = TEXT[locale];
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [serverProblem, setServerProblem] = useState<Problem | null>(null);
  const text = normalizeNoteText(value);
  const problem = noteTextProblem(text);
  // «Пусто» не ругаем, пока человек ничего не ввёл.
  const shown: Problem | null = serverProblem ?? (problem && problem !== "empty" ? problem : null);
  const count = [...text].length;

  const submit = async () => {
    if (problem || busy) return;
    setBusy(true);
    setServerProblem(null);
    try {
      await onSubmit(text);
    } catch (e) {
      setServerProblem(problemOf(e));
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="pointer-events-auto absolute z-20 rounded-xl border border-primary/40 bg-card p-2.5 shadow-xl"
      style={{ left, top, width: NOTE_W + 40 }}
    >
      <textarea
        autoFocus
        value={value}
        rows={3}
        maxLength={NOTE_MAX_CHARS + 20}
        placeholder={tr.placeholder}
        onChange={(e) => {
          setValue(e.target.value);
          setServerProblem(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        data-lenis-prevent
        className="w-full resize-none rounded-lg bg-muted/50 px-2 py-1.5 text-[13px] leading-snug outline-none placeholder:text-muted-foreground focus:bg-muted"
      />
      <div className="mt-1 flex items-center justify-between gap-2">
        <span
          className={cn(
            "min-w-0 flex-1 text-[11px] leading-tight",
            shown ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {shown ? tr.problems[shown] : `${count}/${NOTE_MAX_CHARS}`}
        </span>
        <button
          onClick={onCancel}
          className="cursor-pointer rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          {tr.cancel}
        </button>
        <button
          onClick={submit}
          disabled={!!problem || busy}
          className="cursor-pointer rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground transition-opacity disabled:cursor-default disabled:opacity-40"
        >
          {tr.save}
        </button>
      </div>
    </motion.div>
  );
}
