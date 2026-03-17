"use client";

import Image from "next/image";
import { useApp } from "@/context/app-context";
import { t } from "@/lib/i18n";
import { motion } from "framer-motion";

import { Briefcase, Sparkles } from "lucide-react";
import { AIQuotes } from "@/components/ai-quotes";

const skills = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Tailwind CSS",
  "PostgreSQL",
  "Docker",
  "Git",
  "Python",
  "REST API",
];

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
          className="flex items-center gap-4"
        >
          <div className="h-14 w-14 overflow-hidden rounded-xl border border-border shadow-sm sm:h-16 sm:w-16">
            <Image
              src="/igorlogo.webp"
              alt="Igor Logo"
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          </div>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {tr.about.title}
          </h2>
        </motion.div>

        {/* Bio */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg"
        >
          {tr.about.bio}
        </motion.p>

        {/* My Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.12 }}
          className="mt-8 rounded-xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-sm sm:mt-10 sm:p-6"
        >
          <h3 className="flex items-center gap-2 font-heading text-lg font-semibold sm:text-xl">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            {locale === "ru" ? "Мой путь" : "My Journey"}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {tr.about.bioStory}
          </p>
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

        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 sm:mt-10"
        >
          <h3 className="font-heading text-lg font-semibold sm:text-xl">
            {tr.about.skills}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2 sm:mt-4 sm:gap-3">
            {skills.map((skill, i) => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * i }}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-primary hover:text-primary-foreground sm:px-4 sm:py-2 sm:text-sm"
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
