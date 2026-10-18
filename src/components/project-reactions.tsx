"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { topReactions } from "@/hooks/use-reactions";
import { REACTIONS } from "@/lib/reactions-rules";
import type { ProjectReactions, Reaction } from "@/lib/reactions-rules";

const TEXT = {
  ru: {
    title: "Реакции",
    signIn: "Войди через Звоночек — кнопка с лисёнком в боковой панели, — чтобы реагировать",
    failed: "Не получилось — попробуй ещё раз",
    storage: "Хранилище реакций сейчас недоступно",
  },
  en: {
    title: "Reactions",
    signIn: "Sign in with Zvonochek — the fox button in the side panel — to react",
    failed: "Didn't work — try again",
    storage: "Reaction storage is unavailable right now",
  },
} as const;

/** Панель реакций в карточке проекта: нажать — поставить, ещё раз — снять. */
export function ReactionBar({
  reactions,
  signedIn,
  error,
  locale,
  onToggle,
}: {
  reactions: ProjectReactions | undefined;
  signedIn: boolean;
  error: string | null;
  locale: Locale;
  onToggle: (r: Reaction) => void;
}) {
  const tr = TEXT[locale];
  const mine = reactions?.mine ?? [];
  const note = !signedIn ? tr.signIn : error ? (error === "storage" ? tr.storage : tr.failed) : null;

  return (
    <div className="mt-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{tr.title}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {REACTIONS.map((r) => {
          const count = reactions?.counts[r] ?? 0;
          const active = mine.includes(r);
          return (
            <motion.button
              key={r}
              whileTap={{ scale: 0.88 }}
              onClick={() => signedIn && onToggle(r)}
              aria-pressed={active}
              aria-label={`${r} ${count}`}
              disabled={!signedIn}
              className={cn(
                "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-sm transition-colors disabled:cursor-default",
                active ? "project-chip" : "border-border bg-card hover:bg-muted disabled:hover:bg-card"
              )}
            >
              <span aria-hidden="true">{r}</span>
              <span className="min-w-[1ch] text-xs font-medium tabular-nums">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={count}
                    initial={{ y: -8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 8, opacity: 0 }}
                    className="inline-block"
                  >
                    {count}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.button>
          );
        })}
      </div>
      {note && <p className="mt-2 text-[11px] leading-snug text-muted-foreground">{note}</p>}
    </div>
  );
}

/** Сводка на плитке: только поставленные реакции, самые частые первыми. */
export function ReactionSummary({ reactions }: { reactions: ProjectReactions | undefined }) {
  const top = topReactions(reactions);
  if (top.length === 0) return null;
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {top.map(([r, n]) => (
        <span key={r} className="inline-flex items-center gap-0.5 tabular-nums">
          <span aria-hidden="true">{r}</span>
          {n}
        </span>
      ))}
    </div>
  );
}
