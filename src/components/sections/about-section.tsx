"use client";

import { useApp } from "@/context/app-context";
import { t, translations } from "@/lib/i18n";
import { LocaleText } from "@/components/ui/locale-text";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { AIQuotes } from "@/components/ai-quotes";
import { SkillsMcp } from "@/components/skills-mcp";
import { CodingTools } from "@/components/coding-tools";
import { ShinyText } from "@/components/ui/shiny-text";
import { useHoverSound } from "@/hooks/use-hover-sound";

interface TimelineEntry {
  company: string;
  role: { ru: string; en: string };
  start: string;
  end: string;
  color: string;
  dotColor: string;
  url?: string;
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
  {
    company: "Freelance",
    role: { ru: "Fullstack-разработчик", en: "Fullstack Developer" },
    start: "2026-03",
    end: "now",
    color: "border-amber-500",
    dotColor: "bg-amber-500",
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
      className="relative flex items-center justify-center px-4 py-16 sm:min-h-screen sm:px-6 sm:py-24"
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
            <LocaleText
              locale={locale}
              ru={translations.ru.about.bioStory}
              en={translations.en.about.bioStory}
            />
          </p>

          {/* Skills & MCP */}
          <SkillsMcp locale={locale} />
        </motion.div>

        {/* Coding tools */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.12 }}
          className="mt-8 sm:mt-10"
        >
          <CodingTools locale={locale} />
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
            {timeline.map((entry, i) => {
              const cardClass =
                "group rounded-lg border border-border bg-card/80 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-md sm:p-5";
              const anim = {
                initial: { opacity: 0, y: 15 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true },
                transition: { delay: 0.1 * i },
              } as const;
              const inner = (
                <>
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
                </>
              );

              return entry.url ? (
                <motion.a
                  key={entry.company}
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={playHover}
                  className={`${cardClass} cursor-pointer`}
                  {...anim}
                >
                  {inner}
                </motion.a>
              ) : (
                <motion.div
                  key={entry.company}
                  onMouseEnter={playHover}
                  className={cardClass}
                  {...anim}
                >
                  {inner}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
