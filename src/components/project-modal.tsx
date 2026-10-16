"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Github, GitCommitHorizontal, X } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { CSSProperties } from "react";

export interface Project {
  title: string;
  subtitle: { ru: string; en: string };
  description: { ru: string; en: string };
  /** Оттенок плитки и акцентов карточки, 0–360 в oklch. */
  hue: number;
  tags: string[];
  commercial?: boolean;
  /** Живая демка, если проект где-то развёрнут. */
  live?: string;
  /** owner/name на GitHub. */
  repo?: string;
}

interface Props {
  project: Project | null;
  commits: number | null;
  locale: Locale;
  onClose: () => void;
}

/**
 * Карточка проекта поверх страницы: раньше клик по строке сразу уносил
 * на GitHub, теперь сначала показываем, что это за проект, и уже оттуда
 * даём ссылки на демо и репозиторий.
 */
export function ProjectModal({ project, commits, locale, onClose }: Props) {
  useEffect(() => {
    if (!project) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 24 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{ "--accent-h": project.hue } as CSSProperties}
            className="project-tile relative w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl"
          >
            <button
              onClick={onClose}
              aria-label={locale === "ru" ? "Закрыть" : "Close"}
              className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border bg-card/80 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6 sm:p-8">
              {/* Title */}
              <div className="flex flex-wrap items-center gap-3 pr-10">
                <h3 className="font-heading text-2xl font-black italic tracking-tight sm:text-4xl">
                  {project.title}
                </h3>
                {project.commercial && (
                  <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 ring-1 ring-amber-500/30 dark:text-amber-400">
                    Commercial
                  </span>
                )}
              </div>

              <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {project.subtitle[locale]}
              </p>

              {/* Description — обе локали лежат друг на друге, чтобы высота
                  модалки не прыгала при переключении языка. */}
              <div className="mt-4 grid text-sm leading-relaxed text-foreground/80">
                {(["ru", "en"] as const).map((l) => (
                  <p
                    key={l}
                    style={{ gridArea: "1 / 1" }}
                    aria-hidden={l !== locale}
                    className={l === locale ? undefined : "invisible"}
                  >
                    {project.description[l]}
                  </p>
                ))}
              </div>

              {/* Stack */}
              <div className="mt-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {locale === "ru" ? "Стек" : "Stack"}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="project-chip rounded-full border px-2.5 py-1 text-[11px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {commits != null && commits > 0 && (
                <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <GitCommitHorizontal className="h-4 w-4" />
                  <span className="tabular-nums">{commits}</span>
                  {locale === "ru" ? "коммитов" : "commits"}
                </p>
              )}

              {/* Links */}
              <div className="mt-6 flex flex-wrap gap-2">
                {project.live && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {locale === "ru" ? "Открыть сайт" : "Open site"}
                  </a>
                )}
                {project.repo && (
                  <a
                    href={`https://github.com/${project.repo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    <Github className="h-4 w-4" />
                    {locale === "ru" ? "Репозиторий" : "Repository"}
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
