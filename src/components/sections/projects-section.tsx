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
  GitCommitHorizontal,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useHoverSound } from "@/hooks/use-hover-sound";

interface Project {
  title: string;
  subtitle: { ru: string; en: string };
  url: string;
  icon: React.ElementType;
  repo?: string;
}

const projects: Project[] = [
  {
    title: "SERPIUM",
    subtitle: { ru: "SEO ЛЕНДИНГИ С ИИ", en: "AI SEO LANDING PAGES" },
    url: "https://serpium.up.railway.app/",
    icon: Sparkles,
    repo: "igorao79/serpium",
  },
  {
    title: "XIVEX",
    subtitle: { ru: "ИИ ПОИСКОВИК", en: "AI SEARCH ENGINE" },
    url: "https://xivex.vercel.app/",
    icon: Search,
    repo: "igorao79/xivex",
  },
  {
    title: "SOULCYCLE",
    subtitle: { ru: "САЙТ КНИГИ", en: "BOOK WEBSITE" },
    url: "https://igorao79.github.io/soulcycle/",
    icon: FileText,
    repo: "igorao79/soulcycle",
  },
  {
    title: "CONVERTARYAO",
    subtitle: { ru: "КОНВЕРТЕР ФАЙЛОВ", en: "FILE CONVERTER" },
    url: "https://convertaryao.vercel.app/",
    icon: Repeat,
    repo: "igorao79/convertaryao",
  },
  {
    title: "ZVONOCHEK",
    subtitle: { ru: "ПРИЛОЖЕНИЕ ДЛЯ ЗВОНКОВ", en: "CALLING APP" },
    url: "https://zvonochek.vercel.app/",
    icon: Phone,
    repo: "igorao79/zvonochek",
  },
  {
    title: "2025–2026",
    subtitle: { ru: "ИТОГИ ГОДА", en: "YEAR RECAP" },
    url: "https://igor2025-2026.vercel.app/",
    icon: BarChart3,
    repo: "igorao79/igor2025-2026",
  },
];

export function ProjectsSection() {
  const { locale } = useApp();
  const tr = t(locale);
  const playHover = useHoverSound();
  const [commits, setCommits] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCommits = async () => {
      const results: Record<string, number> = {};
      await Promise.allSettled(
        projects
          .filter((p) => p.repo)
          .map(async (p) => {
            try {
              const res = await fetch(
                `https://api.github.com/repos/${p.repo}/commits?per_page=1`,
                { headers: { Accept: "application/vnd.github.v3+json" } }
              );
              const link = res.headers.get("Link");
              if (link) {
                const match = link.match(/page=(\d+)>; rel="last"/);
                if (match) {
                  results[p.repo!] = parseInt(match[1], 10);
                }
              } else {
                const data = await res.json();
                results[p.repo!] = Array.isArray(data) ? data.length : 0;
              }
            } catch {
              // silently ignore
            }
          })
      );
      setCommits(results);
    };
    fetchCommits();
  }, []);

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

        <div className="mt-6 flex flex-col gap-3 sm:mt-8">
          {projects.map((project, i) => {
            const Icon = project.icon;
            const commitCount = project.repo ? commits[project.repo] : null;
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
                onMouseEnter={playHover}
                className="group flex items-center justify-between overflow-hidden rounded-xl border border-border bg-card px-5 py-4 shadow-sm transition-all hover:scale-[1.02] hover:shadow-xl sm:px-8 sm:py-5"
              >
                <div className="flex items-center gap-3 sm:gap-5">
                  <h3 className="font-heading text-2xl font-black italic tracking-tight sm:text-3xl md:text-4xl">
                    {project.title}
                  </h3>
                  <Icon className="h-5 w-5 text-muted-foreground sm:h-6 sm:w-6" />
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                  {commitCount != null && commitCount > 0 && (
                    <div className="hidden items-center gap-1 text-muted-foreground sm:flex">
                      <GitCommitHorizontal className="h-3.5 w-3.5" />
                      <span className="text-xs tabular-nums">{commitCount}</span>
                    </div>
                  )}
                  <span className="hidden text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground sm:block">
                    {project.subtitle[locale]}
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition-all group-hover:bg-foreground sm:h-10 sm:w-10">
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:rotate-45 group-hover:text-background sm:h-5 sm:w-5" />
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
