"use client";

import { useApp } from "@/context/app-context";
import { t } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { AIQuotes } from "@/components/ai-quotes";
import { PromptCompare } from "@/components/prompt-compare";
import { ShinyText } from "@/components/ui/shiny-text";
import { useHoverSound } from "@/hooks/use-hover-sound";

interface TimelineEntry {
  company: string;
  role: { ru: string; en: string };
  start: string;
  end: string;
  color: string;
  dotColor: string;
  url: string;
}

const timeline: TimelineEntry[] = [
  {
    company: "RPT Team",
    role: { ru: "AI верстальщик / AI Python Developer", en: "AI Developer / AI Python Developer" },
    start: "2024-09",
    end: "2025-12",
    color: "border-indigo-500",
    dotColor: "bg-indigo-500",
    url: "https://vk.com/rptcompany",
  },
  {
    company: "M.S.T.",
    role: { ru: "AI Fullstack Developer", en: "AI Fullstack Developer" },
    start: "2026-01",
    end: "2026-03",
    color: "border-emerald-500",
    dotColor: "bg-emerald-500",
    url: "https://agency-mst.com/",
  },
];

function formatDate(d: string, locale: string): string {
  if (d === "now") return locale === "ru" ? "настоящее время" : "present";
  const date = new Date(d + "-01");
  return date.toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US", {
    month: "short",
    year: "numeric",
  });
}

export function AboutSection() {
  const { locale } = useApp();
  const tr = t(locale);
  const playHover = useHoverSound();

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
            <ShinyText>{tr.about.title}</ShinyText>
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

          {/* Manifesto */}
          <div className="mt-5 border-t border-border pt-5">
            <p className="text-center text-base font-bold leading-snug sm:text-lg">
              {locale === "ru" ? (
                <>
                  Не бездумный промптинг —<br />
                  <span className="text-muted-foreground">а осознанная разработка с ИИ.</span>
                </>
              ) : (
                <>
                  Not mindless prompting —<br />
                  <span className="text-muted-foreground">but intentional development with AI.</span>
                </>
              )}
            </p>
          </div>

          {/* Animated prompt comparison */}
          <PromptCompare locale={locale} />
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

        {/* Experience */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.18 }}
          className="mt-8 sm:mt-10"
        >
          <h3 className="font-heading text-lg font-semibold sm:text-xl">
            {tr.about.experience}
          </h3>

          <div className="mt-4 flex flex-col gap-3 sm:mt-5">
            {timeline.map((entry, i) => (
              <motion.a
                key={entry.company}
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                onMouseEnter={playHover}
                className="group cursor-pointer rounded-lg border border-border bg-card/80 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-md sm:p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-base font-bold transition-colors group-hover:text-primary sm:text-lg">
                    {entry.company}
                  </h4>
                  <span className="text-[11px] tabular-nums text-muted-foreground sm:text-xs">
                    {formatDate(entry.start, locale)} — {formatDate(entry.end, locale)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {entry.role[locale]}
                </p>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
