"use client";

import { useApp } from "@/context/app-context";
import { t } from "@/lib/i18n";
import { motion } from "framer-motion";
import { ExternalLink, Sparkles, Search, Phone, FileText, BarChart3, Repeat } from "lucide-react";

interface Project {
  title: string;
  description: { ru: string; en: string };
  url: string;
  icon: React.ElementType;
  tags: string[];
  color: string;
  featured?: boolean;
}

const projects: Project[] = [
  {
    title: "Serpium",
    description: {
      ru: "Коммерческий проект — генерация SEO-оптимизированных лендингов с помощью ИИ",
      en: "Commercial project — AI-powered SEO-optimized landing page generator",
    },
    url: "https://serpium.up.railway.app/",
    icon: Sparkles,
    tags: ["Next.js", "AI", "SEO", "Commercial"],
    color: "from-violet-500 to-purple-600",
    featured: true,
  },
  {
    title: "Xivex",
    description: {
      ru: "Аналог Perplexity — ИИ-поисковик с интеллектуальными ответами",
      en: "Perplexity alternative — AI search engine with intelligent answers",
    },
    url: "https://xivex.vercel.app/",
    icon: Search,
    tags: ["React", "AI", "Search"],
    color: "from-blue-500 to-cyan-500",
    featured: true,
  },
  {
    title: "SoulCycle",
    description: {
      ru: "Сайт моей книги — красивый лендинг с анимациями",
      en: "My book's website — beautiful landing with animations",
    },
    url: "https://igorao79.github.io/soulcycle/",
    icon: FileText,
    tags: ["HTML", "CSS", "Design"],
    color: "from-amber-500 to-orange-500",
  },
  {
    title: "Convertaryao",
    description: {
      ru: "Конвертер файлов — удобный инструмент для конвертации форматов",
      en: "File converter — handy tool for format conversion",
    },
    url: "https://convertaryao.vercel.app/",
    icon: Repeat,
    tags: ["Next.js", "TypeScript"],
    color: "from-emerald-500 to-teal-500",
  },
  {
    title: "Zvonochek",
    description: {
      ru: "Приложение для звонков — WebRTC видео/аудио звонки",
      en: "Calling app — WebRTC video/audio calls",
    },
    url: "https://zvonochek.vercel.app/",
    icon: Phone,
    tags: ["WebRTC", "React", "Real-time"],
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Итоги 2025–2026",
    description: {
      ru: "Мои итоги за 2025–2026 — интерактивная страница",
      en: "My 2025–2026 recap — interactive page",
    },
    url: "https://igor2025-2026.vercel.app/",
    icon: BarChart3,
    tags: ["Next.js", "Framer Motion"],
    color: "from-pink-500 to-rose-500",
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

        {/* Featured projects — large cards */}
        <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2">
          {projects
            .filter((p) => p.featured)
            .map((project, i) => {
              const Icon = project.icon;
              return (
                <motion.a
                  key={project.title}
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i }}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-xl hover:border-primary/30"
                >
                  {/* Gradient header */}
                  <div
                    className={`flex h-28 items-center justify-center bg-gradient-to-br ${project.color} sm:h-32`}
                  >
                    <Icon className="h-10 w-10 text-white/90 transition-transform group-hover:scale-110 sm:h-12 sm:w-12" />
                  </div>

                  <div className="p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-lg font-semibold">
                        {project.title}
                      </h3>
                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {project.description[locale]}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.a>
              );
            })}
        </div>

        {/* Other projects — compact grid */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {projects
            .filter((p) => !p.featured)
            .map((project, i) => {
              const Icon = project.icon;
              return (
                <motion.a
                  key={project.title}
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i + 0.2 }}
                  className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${project.color}`}
                  >
                    <Icon className="h-5 w-5 text-white/90" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="truncate text-sm font-semibold">
                        {project.title}
                      </h3>
                      <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {project.description[locale]}
                    </p>
                  </div>
                </motion.a>
              );
            })}
        </div>
      </div>
    </section>
  );
}
