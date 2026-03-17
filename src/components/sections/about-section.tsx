"use client";

import { useApp } from "@/context/app-context";
import { t } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Briefcase, Sparkles, Check, X } from "lucide-react";
import { AIQuotes } from "@/components/ai-quotes";

// Timeline: Jan 2024 → Mar 2026 (27 months total)
const TIMELINE_START = new Date("2024-01-01");
const TIMELINE_END = new Date("2026-04-01"); // exclusive end
const TOTAL_MONTHS =
  (TIMELINE_END.getFullYear() - TIMELINE_START.getFullYear()) * 12 +
  (TIMELINE_END.getMonth() - TIMELINE_START.getMonth());

interface TimelineEntry {
  company: string;
  role: { ru: string; en: string };
  color: string;
  start: string; // YYYY-MM
  end: string; // YYYY-MM or "now"
}

const timeline: TimelineEntry[] = [
  {
    company: "RPT Team",
    role: { ru: "Fullstack-разработчик", en: "Fullstack Developer" },
    color: "bg-gradient-to-r from-indigo-500 to-purple-500",
    start: "2024-09",
    end: "now",
  },
  {
    company: "M.S.T",
    role: { ru: "Разработчик", en: "Developer" },
    color: "bg-gradient-to-r from-emerald-500 to-teal-500",
    start: "2025-02",
    end: "2025-03",
  },
];

function monthDiff(from: string): number {
  const d = new Date(from + "-01");
  return (
    (d.getFullYear() - TIMELINE_START.getFullYear()) * 12 +
    (d.getMonth() - TIMELINE_START.getMonth())
  );
}

function monthDiffEnd(to: string): number {
  if (to === "now") {
    const now = new Date();
    return (
      (now.getFullYear() - TIMELINE_START.getFullYear()) * 12 +
      (now.getMonth() - TIMELINE_START.getMonth()) +
      1
    );
  }
  const d = new Date(to + "-01");
  return (
    (d.getFullYear() - TIMELINE_START.getFullYear()) * 12 +
    (d.getMonth() - TIMELINE_START.getMonth()) +
    1
  );
}

// Year labels for the axis
const yearLabels = [2024, 2025, 2026];

const goodPrompt = {
  ru: [
    "$ prompt:",
    "Создай компонент Button на React + TypeScript.",
    "Используй forwardRef, принимай variant",
    '("primary" | "ghost" | "outline"),',
    "size ('sm' | 'md' | 'lg'), и disabled.",
    "Стилизуй через cva из class-variance-authority.",
    "Экспортируй тип ButtonProps.",
  ],
  en: [
    "$ prompt:",
    "Create a Button component in React + TypeScript.",
    "Use forwardRef, accept variant",
    '("primary" | "ghost" | "outline"),',
    "size ('sm' | 'md' | 'lg'), and disabled.",
    "Style with cva from class-variance-authority.",
    "Export the ButtonProps type.",
  ],
};

const badPrompt = {
  ru: ["$ prompt:", "сделай мне кнопку"],
  en: ["$ prompt:", "make me a button"],
};

export function AboutSection() {
  const { locale } = useApp();
  const tr = t(locale);

  return (
    <section
      id="about"
      className="relative flex min-h-screen items-center justify-center px-4 py-20 sm:px-6 sm:py-24"
    >
      <div className="relative z-10 w-full max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {tr.about.title}
          </h2>
        </motion.div>

        {/* My Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-6 rounded-xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-sm sm:mt-8 sm:p-6"
        >
          <h3 className="flex items-center gap-2 font-heading text-lg font-semibold sm:text-xl">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            {locale === "ru" ? "Мой путь" : "My Journey"}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {tr.about.bioStory}
          </p>

          {/* Console examples */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {/* Good prompt */}
            <div className="overflow-hidden rounded-lg border border-emerald-500/30 bg-black/90 dark:bg-black/70">
              <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-400">
                  {locale === "ru" ? "Правильно" : "Good"}
                </span>
              </div>
              <div className="p-3">
                {goodPrompt[locale].map((line, i) => (
                  <p
                    key={i}
                    className={`font-mono text-[11px] leading-relaxed sm:text-xs ${
                      i === 0
                        ? "text-emerald-400"
                        : "text-gray-300"
                    }`}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>

            {/* Bad prompt */}
            <div className="overflow-hidden rounded-lg border border-red-500/30 bg-black/90 dark:bg-black/70">
              <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
                <X className="h-3.5 w-3.5 text-red-400" />
                <span className="text-[10px] font-medium uppercase tracking-wider text-red-400">
                  {locale === "ru" ? "Неправильно" : "Bad"}
                </span>
              </div>
              <div className="p-3">
                {badPrompt[locale].map((line, i) => (
                  <p
                    key={i}
                    className={`font-mono text-[11px] leading-relaxed sm:text-xs ${
                      i === 0
                        ? "text-red-400"
                        : "text-gray-300"
                    }`}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Quotes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.14 }}
          className="mt-8 sm:mt-10"
        >
          <AIQuotes locale={locale} />
        </motion.div>

        {/* Experience Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="mt-8 sm:mt-10"
        >
          <h3 className="flex items-center gap-2 font-heading text-lg font-semibold sm:text-xl">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            {tr.about.experience}
          </h3>

          <div className="mt-4 rounded-xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur-sm sm:mt-5 sm:p-6">
            {/* Single unified bar */}
            <div className="relative h-8 w-full rounded-full bg-muted sm:h-10">
              {timeline.map((entry, i) => {
                const startOffset = monthDiff(entry.start);
                const endOffset = monthDiffEnd(entry.end);
                const leftPct = (startOffset / TOTAL_MONTHS) * 100;
                const widthPct =
                  ((endOffset - startOffset) / TOTAL_MONTHS) * 100;

                return (
                  <motion.div
                    key={entry.company}
                    className={`group absolute top-0 flex h-full cursor-default items-center justify-center overflow-hidden rounded-full ${entry.color} shadow-sm`}
                    style={{ left: `${leftPct}%` }}
                    initial={{ width: 0, opacity: 0 }}
                    whileInView={{ width: `${widthPct}%`, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 1,
                      delay: 0.2 + 0.2 * i,
                      ease: "easeOut",
                    }}
                  >
                    <span className="truncate px-2 text-[9px] font-semibold text-white sm:text-[11px]">
                      {entry.company}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Year axis */}
            <div className="relative mt-2 h-5 w-full">
              {yearLabels.map((year) => {
                const offset =
                  ((year - TIMELINE_START.getFullYear()) * 12) / TOTAL_MONTHS;
                return (
                  <span
                    key={year}
                    className="absolute -translate-x-1/2 text-[10px] tabular-nums text-muted-foreground"
                    style={{ left: `${offset * 100}%` }}
                  >
                    {year}
                  </span>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border pt-3">
              {timeline.map((entry) => (
                <div key={entry.company} className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${entry.color}`} />
                  <span className="text-xs font-medium">{entry.company}</span>
                  <span className="text-[10px] text-muted-foreground">
                    — {entry.role[locale]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
