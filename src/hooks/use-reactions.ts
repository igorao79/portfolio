"use client";

import { useCallback, useEffect, useState } from "react";
import type { useZvonokAuth } from "@/hooks/use-zvonok-auth";
import { REACTIONS } from "@/lib/reactions-rules";
import type { ProjectReactions, Reaction, ReactionProject } from "@/lib/reactions-rules";

type All = Partial<Record<ReactionProject, ProjectReactions>>;

/** Реакции на все проекты: грузим разом, ставим с оптимистичным откатом. */
export function useReactions(auth: ReturnType<typeof useZvonokAuth>) {
  const [all, setAll] = useState<All>({});
  const [error, setError] = useState<string | null>(null);
  const sub = auth.user?.sub;

  // Заново при входе и выходе — от этого зависит, какие реакции «мои».
  useEffect(() => {
    if (!auth.ready) return;
    fetch("/api/reactions")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setAll(d.reactions))
      .catch(() => {});
  }, [auth.ready, sub]);

  const toggle = useCallback(
    async (project: ReactionProject, reaction: Reaction) => {
      const prev = all[project] ?? { counts: {}, mine: [] };
      const on = !prev.mine.includes(reaction);
      const count = (prev.counts[reaction] ?? 0) + (on ? 1 : -1);
      setAll((a) => ({
        ...a,
        [project]: {
          counts: { ...prev.counts, [reaction]: Math.max(0, count) },
          mine: on ? [...prev.mine, reaction] : prev.mine.filter((r) => r !== reaction),
        },
      }));
      setError(null);
      try {
        const res = await fetch("/api/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ project, reaction, on }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "network");
        setAll((a) => ({ ...a, [project]: data.reactions }));
      } catch (e) {
        setAll((a) => ({ ...a, [project]: prev }));
        setError(e instanceof Error ? e.message : "network");
      }
    },
    [all]
  );

  return { all, toggle, error, signedIn: !!auth.user };
}

/** Реакции с ненулевым счётом, по убыванию — для сводки на плитке. */
export function topReactions(r: ProjectReactions | undefined, limit = 3) {
  if (!r) return [];
  return REACTIONS.filter((x) => (r.counts[x] ?? 0) > 0)
    .sort((a, b) => (r.counts[b] ?? 0) - (r.counts[a] ?? 0))
    .slice(0, limit)
    .map((x) => [x, r.counts[x]!] as const);
}
