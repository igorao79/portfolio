"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useApp } from "@/context/app-context";
import type { useZvonokAuth } from "@/hooks/use-zvonok-auth";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { NOTE_MAX_CHARS, NOTE_SECTIONS, normalizeNoteText, noteTextProblem } from "@/lib/notes-rules";
import type { NotePosition, NoteSection, PublicNote } from "@/lib/notes-rules";

/**
 * Заметки на полях. Вошедший через Звоночек может повесить одну короткую
 * заметку, и её видят все.
 *
 * На ПК заметка живёт на полях — в пустом месте сбоку от колонки — и её
 * можно перетащить мышью. Пустое место не размечено заранее: раскладка у
 * секций разная, а на другом экране всё едет, поэтому каждый раз меряем,
 * где сейчас лежит контент, и свободным считаем всё, что с ним не
 * пересекается.
 *
 * На узком экране полей нет, и заметки встают в поток между блоками —
 * в тот зазор, что ближе к их месту по высоте секции. Двигать их там
 * нельзя, а если в один зазор попало несколько, они ложатся внахлёст.
 */

type Auth = ReturnType<typeof useZvonokAuth>;

/** Событие из карточки профиля: «повесить заметку» или «отредактировать». */
export const OPEN_NOTE_EVENT = "notes:open";

// Есть ли у вошедшего своя заметка — от этого зависит подпись кнопки в
// профиле. Маленький стор вместо пропсов через пол-страницы.
let ownNote = false;
const ownListeners = new Set<() => void>();
function setOwnNote(value: boolean) {
  if (value === ownNote) return;
  ownNote = value;
  ownListeners.forEach((l) => l());
}
function subscribeOwn(cb: () => void) {
  ownListeners.add(cb);
  return () => {
    ownListeners.delete(cb);
  };
}
export function useHasOwnNote() {
  return useSyncExternalStore(subscribeOwn, () => ownNote, () => false);
}

const NOTE_W = 184;
/** Высота «призрака» при выборе места — примерно как у заметки в 2–3 строки. */
const GHOST_H = 84;
/** Отступ, который заметка держит от контента и краёв. */
const GAP = 12;
/** Уже этого полей нет — заметки уходят в поток между блоками. */
const MIN_WIDE = 1024;

const TEXT = {
  ru: {
    placeHint: "Кликни по свободному месту на полях",
    escHint: "Esc — отмена",
    placeholder: "Пара слов на полях…",
    sheetHint: "Заметка встанет между блоками — там, где ты сейчас",
    save: "Повесить",
    update: "Сохранить",
    cancel: "Отмена",
    remove: "Убрать",
    removeNote: "Убрать заметку",
    problems: {
      empty: "Напиши хоть что-нибудь",
      tooLong: `Не больше ${NOTE_MAX_CHARS} символов`,
      tooManyLines: "Не больше 4 строк",
      link: "Ссылки оставлять нельзя",
      position: "Здесь заметке не место",
      limit: "У тебя уже есть заметка — её можно отредактировать",
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
    sheetHint: "The note goes between blocks — right where you are",
    save: "Pin it",
    update: "Save",
    cancel: "Cancel",
    remove: "Remove",
    removeNote: "Remove note",
    problems: {
      empty: "Write something first",
      tooLong: `${NOTE_MAX_CHARS} characters max`,
      tooManyLines: "4 lines max",
      link: "Links aren't allowed",
      position: "A note can't go here",
      limit: "You already have a note — you can edit it",
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

interface SectionBox {
  id: NoteSection;
  top: number;
  bottom: number;
  /** Высота без наших слотов: иначе доля r плыла бы от самих заметок. */
  height: number;
  slots: { top: number; h: number }[];
}

/** Зазор между блоками колонки — место для заметок на узком экране. */
interface Gap {
  key: string;
  section: NoteSection;
  rel: number;
  parent: Element;
  before: Element | null;
  width: number;
}

interface Snapshot {
  width: number;
  height: number;
  center: number;
  flow: boolean;
  sections: SectionBox[];
  /** Всё, на что заметке ложиться нельзя, в координатах документа. */
  blocks: Rect[];
  gaps: Gap[];
}

type Place =
  | { kind: "margin"; left: number; top: number }
  | { kind: "flow"; gap: string }
  | { kind: "hidden" };

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

const outOfFlow = (el: Element) => {
  const p = getComputedStyle(el).position;
  return p === "absolute" || p === "fixed";
};

/** Доля высоты секции для точки документа — без учёта наших слотов. */
function relIn(box: SectionBox, y: number) {
  const above = box.slots.reduce((sum, s) => (s.top < y ? sum + s.h : sum), 0);
  return Math.min(1, Math.max(0, (y - box.top - above) / box.height));
}

/** Меряет страницу как она есть сейчас. */
function measure(): Snapshot {
  const width = document.documentElement.clientWidth;
  const height = document.documentElement.scrollHeight;
  const sections: SectionBox[] = [];
  const blocks: Rect[] = [];
  const gaps: Gap[] = [];

  for (const id of NOTE_SECTIONS) {
    const section = document.getElementById(id);
    if (!section) continue;
    const r = docRect(section);
    const slots = Array.from(section.querySelectorAll("[data-note-slot]")).map((el) => {
      const s = docRect(el);
      return { top: s.top, h: s.bottom - s.top };
    });
    const box: SectionBox = {
      id,
      top: r.top,
      bottom: r.bottom,
      height: Math.max(1, r.bottom - r.top - slots.reduce((sum, s) => sum + s.h, 0)),
      slots,
    };
    sections.push(box);

    // Контент секции — её прямые потомки: колонка, бегущая строка героя.
    // Модалки (fixed) лежат вне потока и полей не занимают.
    for (const child of Array.from(section.children)) {
      if (getComputedStyle(child).position === "fixed") continue;
      const cr = docRect(child);
      if (cr.right - cr.left > 0 && cr.bottom - cr.top > 0) blocks.push(cr);
    }

    // Зазоры — между блоками колонки (первый потомок секции в потоке).
    const column = Array.from(section.children).find((el) => !outOfFlow(el) && el.children.length > 0);
    if (!column) continue;
    const kids = Array.from(column.children).filter(
      (el) => !el.hasAttribute("data-note-slot") && !outOfFlow(el) && el.getBoundingClientRect().height > 0
    );
    const columnWidth = column.getBoundingClientRect().width;
    for (let i = 1; i <= kids.length; i++) {
      const prev = docRect(kids[i - 1]);
      const next = kids[i] ? docRect(kids[i]) : null;
      gaps.push({
        key: `${id}:${i}`,
        section: id,
        rel: relIn(box, next ? (prev.bottom + next.top) / 2 : prev.bottom),
        parent: column,
        before: kids[i] ?? null,
        width: columnWidth,
      });
    }
  }

  // Сайдбар прибит к правому краю вьюпорта — значит, во всю высоту.
  const aside = document.querySelector("aside");
  if (aside) {
    const r = aside.getBoundingClientRect();
    if (r.width > 0) blocks.push({ left: r.left, top: 0, right: width, bottom: height });
  }

  return { width, height, center: width / 2, flow: width < MIN_WIDE, sections, blocks, gaps };
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
function anchor(snap: Snapshot, left: number, top: number): NotePosition | null {
  const box = sectionAt(snap, top);
  if (!box) return null;
  return {
    section: box.id,
    x: Math.round(left - snap.center),
    y: Math.round(top - box.top),
    r: relIn(box, top),
  };
}

/** Место на полях для заметки, повешенной с телефона: ищем рядом с её долей. */
function autoPlace(snap: Snapshot, box: SectionBox, note: PublicNote, h: number, taken: Rect[]) {
  const base = box.top + note.r * box.height - h / 2;
  const lefts: number[] = [];
  for (let l = GAP; l + NOTE_W <= snap.width - GAP; l += 24) lefts.push(l);
  // Сторону выбирает хэш, а внутри стороны — поближе к краю страницы.
  if (hashOf(note.id) % 2) lefts.reverse();
  for (let step = 0; step <= 20; step++) {
    const dy = (step % 2 ? -1 : 1) * Math.ceil(step / 2) * 30;
    for (const left of lefts) {
      const rect = rectAt(left, base + dy, h);
      if (fits(snap, rect, taken)) return { left, top: rect.top };
    }
  }
  return null;
}

/** Где каждая заметка стоит на этом экране. */
function layOut(snap: Snapshot, notes: PublicNote[], heights: Record<string, number>) {
  const out = new Map<string, Place>();

  if (snap.flow) {
    for (const note of notes) {
      const own = snap.gaps.filter((g) => g.section === note.section);
      const pool = own.length ? own : snap.gaps;
      let best: Gap | null = null;
      for (const g of pool) {
        if (!best || Math.abs(g.rel - note.r) < Math.abs(best.rel - note.r)) best = g;
      }
      out.set(note.id, best ? { kind: "flow", gap: best.key } : { kind: "hidden" });
    }
    return out;
  }

  const taken: Rect[] = [];
  // Сначала те, что стоят там, куда их поставили руками, потом — подбор.
  const ordered = [...notes].sort((a, b) => Number(a.x === null) - Number(b.x === null));
  for (const note of ordered) {
    const box = snap.sections.find((s) => s.id === note.section);
    const h = heights[note.id] ?? GHOST_H;
    let pos: { left: number; top: number } | null = null;
    if (box && note.x !== null && note.y !== null) {
      const p = { left: snap.center + note.x, top: box.top + note.y };
      if (fits(snap, rectAt(p.left, p.top, h))) pos = p;
    } else if (box) {
      pos = autoPlace(snap, box, note, h, taken);
    }
    if (pos) {
      taken.push(rectAt(pos.left, pos.top, h));
      out.set(note.id, { kind: "margin", ...pos });
    } else {
      out.set(note.id, { kind: "hidden" });
    }
  }
  return out;
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
  | {
      kind: "compose";
      /** Своя заметка, которую правим; null — новая. */
      noteId: string | null;
      initial: string;
      /** Где открыть редактор на полях; null — шторкой снизу. */
      at: { left: number; top: number } | null;
      /** Новая заметка с узкого экрана: только секция и доля. */
      rel: { section: NoteSection; r: number } | null;
    };

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
  /** Какую заметку из стопки подняли наверх касанием. */
  const [front, setFront] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const noteEls = useRef(new Map<string, HTMLDivElement>());
  /** Контейнеры под стопки в зазорах; Map одна на всю жизнь компонента. */
  const [slotEls] = useState(() => new Map<string, HTMLDivElement>());

  // Порталу нужен document — на сервере его нет.
  const mounted = useSyncExternalStore(noop, () => true, () => false);

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

  useEffect(() => {
    setOwnNote(!!user && notes.some((n) => n.mine));
  }, [notes, user]);

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

  const layout = useMemo(
    () => (snap ? layOut(snap, notes, heights) : new Map<string, Place>()),
    [snap, notes, heights]
  );

  const marginRects = (exceptId?: string) =>
    notes.flatMap((n) => {
      const p = layout.get(n.id);
      return n.id !== exceptId && p?.kind === "margin" ? [rectAt(p.left, p.top, heights[n.id] ?? GHOST_H)] : [];
    });

  // ── слоты между блоками (узкий экран) ──
  const flowGroups = new Map<string, PublicNote[]>();
  for (const note of notes) {
    const p = layout.get(note.id);
    if (p?.kind === "flow") flowGroups.set(p.gap, [...(flowGroups.get(p.gap) ?? []), note]);
  }

  /** Контейнер под стопку в зазоре. Создаётся отвязанным — вставит эффект. */
  const slotFor = (key: string) => {
    let el = slotEls.get(key);
    if (!el) {
      el = document.createElement("div");
      el.dataset.noteSlot = key;
      el.className = "relative z-20 flex justify-center pt-6";
      slotEls.set(key, el);
    }
    return el;
  };

  const flowKeys = [...flowGroups.keys()].join("|");
  useLayoutEffect(() => {
    if (!snap) return;
    const wanted = new Set(flowKeys ? flowKeys.split("|") : []);
    for (const [key, el] of slotEls) {
      if (!wanted.has(key)) {
        el.remove();
        slotEls.delete(key);
      }
    }
    for (const key of wanted) {
      const gap = snap.gaps.find((g) => g.key === key);
      const el = slotEls.get(key);
      if (!gap || !el) continue;
      if (el.parentElement !== gap.parent || el.nextElementSibling !== gap.before) {
        gap.parent.insertBefore(el, gap.before);
      }
    }
  }, [flowKeys, snap, slotEls]);

  useEffect(() => () => slotEls.forEach((el) => el.remove()), [slotEls]);

  // ── открыть редактор из профиля ──
  useEffect(() => {
    const onOpen = () => {
      if (!user) return setToast(tr.problems.auth);
      const s = measure();
      setSnap(s);
      const own = notes.find((n) => n.mine);
      if (own) {
        const p = layout.get(own.id);
        setMode({
          kind: "compose",
          noteId: own.id,
          initial: own.text,
          at: !s.flow && p?.kind === "margin" ? { left: p.left, top: p.top } : null,
          rel: null,
        });
        return;
      }
      if (s.flow) {
        // С телефона место не выбирают: заметка встаёт туда, где человек читает.
        const y = window.scrollY + window.innerHeight / 2;
        const box =
          sectionAt(s, y) ??
          s.sections.reduce<SectionBox | null>(
            (best, b) => (!best || Math.abs(b.top - y) < Math.abs(best.top - y) ? b : best),
            null
          );
        if (!box) return setToast(tr.problems.position);
        setMode({ kind: "compose", noteId: null, initial: "", at: null, rel: { section: box.id, r: relIn(box, y) } });
        return;
      }
      setMode({ kind: "placing", clientX: -1000, clientY: -1000 });
    };
    window.addEventListener(OPEN_NOTE_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_NOTE_EVENT, onOpen);
  }, [user, notes, layout, tr]);

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
          return { left, top, ok: fits(snap, rectAt(left, top, GHOST_H), marginRects()) };
        })()
      : null;

  const submit = async (text: string) => {
    if (mode.kind !== "compose") return;
    if (mode.noteId) {
      const { note } = await api<{ note: PublicNote }>(`/api/notes/${mode.noteId}`, {
        method: "PATCH",
        body: JSON.stringify({ text }),
      });
      setNotes((list) => list.map((n) => (n.id === note.id ? note : n)));
    } else {
      const position = mode.at
        ? anchor(measure(), mode.at.left, mode.at.top)
        : mode.rel && { ...mode.rel, x: null, y: null };
      if (!position) throw new NoteError("position");
      const { note } = await api<{ note: PublicNote }>("/api/notes", {
        method: "POST",
        body: JSON.stringify({ text, ...position }),
      });
      setNotes((list) => [...list, note]);
    }
    setMode(IDLE);
  };

  const remove = async (id: string) => {
    const prev = notes;
    setNotes((list) => list.filter((n) => n.id !== id));
    if (mode.kind === "compose" && mode.noteId === id) setMode(IDLE);
    try {
      await api(`/api/notes/${id}`, { method: "DELETE" });
    } catch (e) {
      setNotes(prev);
      setToast(tr.problems[problemOf(e)]);
    }
  };

  // ── перетаскивание: только мышью и только на полях ──
  const onNoteDown = (note: PublicNote, e: ReactPointerEvent<HTMLDivElement>) => {
    if (!note.mine || e.pointerType !== "mouse" || e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button")) return;
    const p = layout.get(note.id);
    if (p?.kind !== "margin") return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setSnap(measure());
    setDrag({
      id: note.id,
      dx: e.pageX - p.left,
      dy: e.pageY - p.top,
      left: p.left,
      top: p.top,
      startLeft: p.left,
      startTop: p.top,
      ok: true,
    });
  };

  const onNoteMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag || !snap) return;
    const left = e.pageX - drag.dx;
    const top = e.pageY - drag.dy;
    const h = heights[drag.id] ?? GHOST_H;
    setDrag({ ...drag, left, top, ok: fits(snap, rectAt(left, top, h), marginRects(drag.id)) });
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
      setToast(tr.problems[problemOf(e)]);
    }
  };

  if (!mounted) return null;

  const editingId = mode.kind === "compose" ? mode.noteId : null;
  const editor =
    mode.kind === "compose" ? (
      <NoteEditor
        key={mode.noteId ?? "new"}
        locale={locale}
        at={mode.at}
        initial={mode.initial}
        editing={!!mode.noteId}
        hint={!mode.noteId && !mode.at ? tr.sheetHint : null}
        onCancel={() => setMode(IDLE)}
        onSubmit={submit}
        onRemove={mode.noteId ? () => remove(mode.noteId!) : undefined}
      />
    ) : null;

  const card = (note: PublicNote, style: CSSProperties, extra: Partial<CardProps> = {}) => (
    <NoteCard
      key={note.id}
      note={note}
      locale={locale}
      ref={(el) => {
        if (el) noteEls.current.set(note.id, el);
        else noteEls.current.delete(note.id);
      }}
      style={style}
      hidden={false}
      draggable={false}
      dragging={false}
      invalid={false}
      canRemove={note.mine || admin}
      onRemove={() => remove(note.id)}
      {...extra}
    />
  );

  return (
    <>
      {/* Слой в координатах документа: предки статичны, так что absolute
          здесь отсчитывается от самого верха страницы и едет со скроллом. */}
      <div aria-label="Notes" className="pointer-events-none absolute left-0 top-0 z-30 w-full">
        {notes.map((note) => {
          const p = layout.get(note.id);
          if (p?.kind === "flow") return null;
          const dragging = drag?.id === note.id;
          const pos = dragging ? drag : p?.kind === "margin" ? p : null;
          return card(
            note,
            { position: "absolute", left: pos?.left ?? 0, top: pos?.top ?? 0 },
            {
              hidden: !pos || editingId === note.id,
              draggable: note.mine && p?.kind === "margin",
              dragging,
              invalid: dragging && !drag.ok,
              onPointerDown: (e) => onNoteDown(note, e),
              onPointerMove: onNoteMove,
              onPointerUp: onNoteUp,
              onPointerCancel: () => setDrag(null),
            }
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

        {editor && mode.kind === "compose" && mode.at && editor}
      </div>

      {/* Стопки в зазорах между блоками. Не влезают в ширину колонки —
          ложатся внахлёст, а касание поднимает заметку наверх. */}
      {[...flowGroups].map(([key, group]) => {
        const gap = snap?.gaps.find((g) => g.key === key);
        const width = gap?.width ?? NOTE_W;
        const overlap =
          group.length > 1 ? Math.max(0, (group.length * NOTE_W + (group.length - 1) * 8 - width) / (group.length - 1)) : 0;
        return (
          <Fragment key={key}>
            {createPortal(
              group.map((note, i) =>
                card(note, {
                  position: "relative",
                  marginLeft: i === 0 ? 0 : overlap > 0 ? -overlap + 8 : 8,
                  zIndex: front === note.id ? group.length + 1 : i,
                }, {
                  hidden: editingId === note.id && !!(mode.kind === "compose" && mode.at),
                  onClick: () => setFront(note.id),
                })
              ),
              slotFor(key)
            )}
          </Fragment>
        );
      })}

      {createPortal(
        <>
          {/* Пока выбираем место — ловим клики поверх всей страницы, чтобы
              случайно не нажать ссылку или кнопку под курсором. */}
          {mode.kind === "placing" && (
            <div
              className="fixed inset-0 z-[60] cursor-crosshair"
              onPointerMove={(e) => setMode({ kind: "placing", clientX: e.clientX, clientY: e.clientY })}
              onClick={(e) => {
                const left = e.clientX + window.scrollX - NOTE_W / 2;
                const top = e.clientY + window.scrollY - 18;
                if (!fits(measure(), rectAt(left, top, GHOST_H), marginRects())) {
                  setToast(tr.problems.position);
                  return;
                }
                setMode({ kind: "compose", noteId: null, initial: "", at: { left, top }, rel: null });
              }}
            />
          )}

          {editor && mode.kind === "compose" && !mode.at && (
            <div
              className="fixed inset-0 z-[70] flex items-end justify-center bg-black/30 p-3 backdrop-blur-[2px] sm:items-center"
              onClick={() => setMode(IDLE)}
            >
              <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                {editor}
              </div>
            </div>
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
                className="fixed bottom-20 left-1/2 z-[71] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-full border border-border bg-card px-4 py-2 text-center text-xs shadow-lg md:bottom-6"
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
  style: CSSProperties;
  hidden: boolean;
  draggable: boolean;
  dragging: boolean;
  invalid: boolean;
  canRemove: boolean;
  onRemove: () => void;
  onClick?: () => void;
  onPointerDown?: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove?: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp?: () => void;
  onPointerCancel?: () => void;
}

function NoteCard({
  note,
  locale,
  ref,
  style,
  hidden,
  draggable,
  dragging,
  invalid,
  canRemove,
  onRemove,
  ...handlers
}: CardProps) {
  const seed = hashOf(note.id);
  const hue = seed % 360;
  const tilt = ((seed >> 3) % 5) - 2; // −2°…2°
  const author = note.username ? `@${note.username}` : note.name ?? "—";

  return (
    <div
      ref={ref}
      {...handlers}
      className={cn(
        "group shrink-0 select-none rounded-xl border bg-card/90 p-3 pt-3.5 shadow-sm backdrop-blur-sm transition-[box-shadow,transform,border-color] duration-150",
        hidden ? "invisible" : "pointer-events-auto",
        note.mine ? "border-primary/30" : "border-border",
        draggable && "cursor-grab",
        dragging && "z-10 cursor-grabbing shadow-xl",
        invalid && "border-destructive"
      )}
      style={{
        ...style,
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
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={TEXT[locale].removeNote}
          title={TEXT[locale].removeNote}
          className="absolute -right-2 -top-2 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-muted-foreground opacity-0 shadow-sm transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
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
  at,
  initial,
  editing,
  hint,
  onCancel,
  onSubmit,
  onRemove,
}: {
  locale: Locale;
  at: { left: number; top: number } | null;
  initial: string;
  editing: boolean;
  hint: string | null;
  onCancel: () => void;
  onSubmit: (text: string) => Promise<void>;
  onRemove?: () => void;
}) {
  const tr = TEXT[locale];
  const [value, setValue] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [serverProblem, setServerProblem] = useState<Problem | null>(null);
  const text = normalizeNoteText(value);
  const problem = noteTextProblem(text);
  const unchanged = editing && text === normalizeNoteText(initial);
  // «Пусто» не ругаем, пока человек ничего не ввёл.
  const shown: Problem | null = serverProblem ?? (problem && problem !== "empty" ? problem : null);
  const count = [...text].length;

  const submit = async () => {
    if (problem || busy) return;
    if (unchanged) return onCancel();
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
      className={cn(
        "pointer-events-auto rounded-xl border border-primary/40 bg-card p-2.5 shadow-xl",
        at && "absolute z-20"
      )}
      style={at ? { left: at.left, top: at.top, width: NOTE_W + 40 } : undefined}
    >
      {hint && <p className="mb-1.5 px-0.5 text-[11px] leading-snug text-muted-foreground">{hint}</p>}
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
      <div className="mt-1 flex items-center justify-between gap-1.5">
        <span
          className={cn(
            "min-w-0 flex-1 text-[11px] leading-tight",
            shown ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {shown ? tr.problems[shown] : `${count}/${NOTE_MAX_CHARS}`}
        </span>
        {onRemove && (
          <button
            onClick={onRemove}
            className="cursor-pointer rounded-md px-1.5 py-1 text-[11px] text-destructive transition-opacity hover:opacity-80"
          >
            {tr.remove}
          </button>
        )}
        <button
          onClick={onCancel}
          className="cursor-pointer rounded-md px-1.5 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          {tr.cancel}
        </button>
        <button
          onClick={submit}
          disabled={!!problem || busy}
          className="cursor-pointer rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground transition-opacity disabled:cursor-default disabled:opacity-40"
        >
          {editing ? tr.update : tr.save}
        </button>
      </div>
    </motion.div>
  );
}
