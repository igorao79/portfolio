"use client";

import { Fragment, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export interface FlowStep {
  icon: LucideIcon;
  /** Подпись под иконкой — одно короткое слово, на мобилке места мало. */
  label: { ru: string; en: string };
  /** Что происходит на шаге — показывается под схемой, пока он активен. */
  hint: { ru: string; en: string };
}

/** Сколько держится каждый шаг, прежде чем поток уйдёт дальше. */
const STEP_MS = 2400;

/**
 * Схема того, как проект устроен внутри: цепочка шагов, по которой бежит
 * поток. Показывает инженерию там, где саму систему показать нельзя —
 * админка коммерческая. Наведение ставит на паузу, клик по шагу — к нему.
 */
export function ProjectFlow({ steps, locale }: { steps: FlowStep[]; locale: Locale }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduce || paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % steps.length), STEP_MS);
    return () => clearInterval(id);
  }, [reduce, paused, steps.length]);

  const step = steps[active];

  return (
    <div className="mt-5" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {locale === "ru" ? "Как это работает" : "How it works"}
      </p>

      <div className="mt-2 rounded-xl border border-border bg-muted/30 p-2.5 sm:p-4">
        <div className="flex items-start">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const done = i < active;
            const current = i === active;
            return (
              <Fragment key={s.label.en}>
                {i > 0 && (
                  // Линия к шагу: пройденные залиты, к текущему поток
                  // «доезжает» — заливка растёт слева направо.
                  <div className="relative mt-[17px] h-0.5 min-w-1 flex-1 overflow-hidden rounded-full bg-border">
                    <motion.span
                      className="absolute inset-0 origin-left rounded-full"
                      style={{ background: "var(--tint)" }}
                      initial={false}
                      animate={{ scaleX: done || current ? 1 : 0 }}
                      transition={{ duration: current && !reduce ? 0.6 : 0.2, ease: "easeOut" }}
                    />
                  </div>
                )}
                <button
                  onClick={() => setActive(i)}
                  aria-current={current ? "step" : undefined}
                  className="flex w-10 shrink-0 cursor-pointer flex-col items-center gap-1.5 sm:w-14"
                >
                  <span className="relative flex h-9 w-9 items-center justify-center">
                    {current && !reduce && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 animate-ping rounded-full opacity-30"
                        style={{ background: "var(--tint)" }}
                      />
                    )}
                    <span
                      className={cn(
                        "relative flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300",
                        current
                          ? "scale-110 border-transparent text-[var(--card)] shadow-md"
                          : done
                            ? "project-chip"
                            : "border-border bg-card text-muted-foreground"
                      )}
                      style={current ? { background: "var(--tint)" } : undefined}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                  </span>
                  <span
                    className={cn(
                      "whitespace-nowrap text-center text-[10px] font-medium leading-tight transition-colors",
                      current ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {s.label[locale]}
                  </span>
                </button>
              </Fragment>
            );
          })}
        </div>

        {/* Высота под подпись зарезервирована: тексты разной длины не
            должны дёргать модалку. */}
        <div className="relative mt-3 min-h-[3.5rem] border-t border-border pt-2.5 text-xs leading-relaxed">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={active}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-foreground/80"
            >
              <span className="font-semibold text-foreground">
                {active + 1}. {step.label[locale]}
              </span>{" "}
              — {step.hint[locale]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
