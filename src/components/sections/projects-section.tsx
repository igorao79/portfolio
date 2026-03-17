"use client";

import { useApp } from "@/context/app-context";
import { t } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Star, ExternalLink, Github } from "lucide-react";
import { useEffect, useState } from "react";


interface GithubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  language: string | null;
  topics: string[];
}

const GITHUB_USERNAME = "igor";

export function ProjectsSection() {
  const { locale } = useApp();
  const tr = t(locale);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRepos(data.filter((r: GithubRepo) => !r.name.includes(".github")));
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const langColors: Record<string, string> = {
    TypeScript: "bg-blue-500",
    JavaScript: "bg-yellow-400",
    Python: "bg-green-500",
    HTML: "bg-orange-500",
    CSS: "bg-purple-500",
    Go: "bg-cyan-500",
    Rust: "bg-red-500",
  };

  return (
    <section
      id="projects"
      className="relative flex min-h-screen items-center justify-center px-4 py-20 sm:px-6 sm:py-24"
    >

      <div className="relative z-10 w-full max-w-4xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-heading text-3xl font-bold tracking-tight sm:text-4xl"
        >
          {tr.projects.title}
        </motion.h2>

        {loading && (
          <p className="mt-8 text-muted-foreground">{tr.projects.loading}</p>
        )}

        {error && (
          <p className="mt-8 text-destructive">{tr.projects.error}</p>
        )}

        <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4">
          {repos.map((repo, i) => (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i }}
              className="group rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/30 sm:p-5"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-base font-semibold sm:text-lg">{repo.name}</h3>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Star className="h-3.5 w-3.5" />
                  <span className="text-xs">{repo.stargazers_count}</span>
                </div>
              </div>

              {repo.description && (
                <p className="mt-2 text-xs text-muted-foreground line-clamp-2 sm:text-sm">
                  {repo.description}
                </p>
              )}

              <div className="mt-3 flex items-center gap-3 sm:mt-4">
                {repo.language && (
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        langColors[repo.language] || "bg-gray-400"
                      }`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {repo.language}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3 flex gap-2 sm:mt-4">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-primary hover:text-primary-foreground sm:px-3 sm:py-1.5"
                >
                  <Github className="h-3 w-3" />
                  {tr.projects.viewCode}
                </a>
                {repo.homepage && (
                  <a
                    href={repo.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-primary hover:text-primary-foreground sm:px-3 sm:py-1.5"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {tr.projects.viewDemo}
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
