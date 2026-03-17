"use client";

import { useApp } from "@/context/app-context";
import { t } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Briefcase, Sparkles, Check, X } from "lucide-react";
import { AIQuotes } from "@/components/ai-quotes";

const experience = [
  {
    company: "RPT Team",
    role: { ru: "Fullstack-разработчик", en: "Fullstack Developer" },
    duration: { ru: "1.5 года", en: "1.5 years" },
    progress: 0.75,
    color: "from-indigo-500 to-purple-500",
  },
  {
    company: "M.S.T",
    role: { ru: "Разработчик", en: "Developer" },
    duration: { ru: "1 месяц", en: "1 month" },
    progress: 0.06,
    color: "from-emerald-500 to-teal-500",
  },
];

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

        {/* Experience */}
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

          <div className="mt-4 space-y-4 sm:mt-5">
            {experience.map((exp, i) => (
              <motion.div
                key={exp.company}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i + 0.2 }}
                className="rounded-xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur-sm sm:p-5"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="font-heading text-base font-semibold sm:text-lg">
                      {exp.company}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {exp.role[locale]}
                    </p>
                  </div>
                  <span className="mt-1 text-xs font-medium text-muted-foreground sm:mt-0 sm:text-sm">
                    {exp.duration[locale]}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${exp.color}`}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.max(exp.progress * 100, 4)}%` }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 1.2,
                      delay: 0.3 + 0.15 * i,
                      ease: "easeOut",
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
