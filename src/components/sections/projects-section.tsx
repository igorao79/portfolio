"use client";

import { useApp } from "@/context/app-context";
import { t } from "@/lib/i18n";
import { motion } from "framer-motion";
import {
  Sparkles,
  Search,
  Phone,
  FileText,
  BarChart3,
  Repeat,
  ArrowUpRight,
} from "lucide-react";

interface Project {
  title: string;
  subtitle: { ru: string; en: string };
  url: string;
  icon: React.ElementType;
}

const projects: Project[] = [
  {
    title: "SERPIUM",
    subtitle: {
      ru: "SEO ЛЕНДИНГИ С ИИ",
      en: "AI SEO LANDING PAGES",
    },
    url: "https://serpium.up.railway.app/",
    icon: Sparkles,
  },
  {
    title: "XIVEX",
    subtitle: {
      ru: "ИИ ПОИСКОВИК",
      en: "AI SEARCH ENGINE",
    },
    url: "https://xivex.vercel.app/",
    icon: Search,
  },
  {
    title: "SOULCYCLE",
    subtitle: {
      ru: "САЙТ КНИГИ",
      en: "BOOK WEBSITE",
    },
    url: "https://igorao79.github.io/soulcycle/",
    icon: FileText,
  },
  {
    title: "CONVERTARYAO",
    subtitle: {
      ru: "КОНВЕРТЕР ФАЙЛОВ",
      en: "FILE CONVERTER",
    },
    url: "https://convertaryao.vercel.app/",
    icon: Repeat,
  },
  {
    title: "ZVONOCHEK",
    subtitle: {
      ru: "ПРИЛОЖЕНИЕ ДЛЯ ЗВОНКОВ",
      en: "CALLING APP",
    },
    url: "https://zvonochek.vercel.app/",
    icon: Phone,
  },
  {
    title: "2025–2026",
    subtitle: {
      ru: "ИТОГИ ГОДА",
      en: "YEAR RECAP",
    },
    url: "https://igor2025-2026.vercel.app/",
    icon: BarChart3,
  },
];

export function ProjectsSection() {
  const { locale } = useApp();
  const tr = t(locale);

  return (
    <section
      id="projects"
      className="relative flex min-h-screen items-center justify-center px-4 py-20 sm:px-6 sm:py-24"
    >
      <div className="relative z-10 w-full max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-heading text-3xl font-bold tracking-tight sm:text-4xl"
        >
          {tr.projects.title}
        </motion.h2>

        {/* Horizontal stripe cards */}
        <div className="mt-6 flex flex-col gap-3 sm:mt-8">
          {projects.map((project, i) => {
            const Icon = project.icon;
            return (
              <motion.a
                key={project.title}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 * i }}
                className="group flex items-center justify-between overflow-hidden rounded-xl bg-foreground px-5 py-4 transition-all hover:scale-[1.02] hover:shadow-xl sm:px-8 sm:py-5"
              >
                <div className="flex items-center gap-4 sm:gap-6">
                  {/* Big bold title */}
                  <h3 className="font-heading text-2xl font-black italic tracking-tight text-background sm:text-3xl md:text-4xl">
                    {project.title}
                  </h3>
                  {/* Icon */}
                  <Icon className="h-5 w-5 text-background/50 sm:h-6 sm:w-6" />
                </div>

                <div className="flex items-center gap-3 sm:gap-5">
                  {/* Subtitle */}
                  <span className="hidden text-[10px] font-semibold uppercase tracking-[0.15em] text-background/40 sm:block">
                    {project.subtitle[locale]}
                  </span>
                  {/* Arrow */}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-background/20 transition-colors group-hover:bg-background group-hover:text-foreground sm:h-10 sm:w-10">
                    <ArrowUpRight className="h-4 w-4 text-background/60 transition-colors group-hover:text-foreground sm:h-5 sm:w-5" />
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
