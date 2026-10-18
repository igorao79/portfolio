/**
 * Где живут реакции. В Redis — по множеству на пару «проект + реакция»
 * (`react:CRYPTOMIA:🔥` → sub-ы поставивших): SADD/SREM атомарны, так что
 * два одновременных клика не затрут друг друга, как было бы с
 * прочитать-поменять-записать. Локально — `.data/reactions.json`.
 */
import { REDIS_ENABLED, readJson, redis, redisPipeline, writeJson } from "@/lib/kv";
import { REACTIONS, REACTION_PROJECTS } from "@/lib/reactions-rules";
import type { ProjectReactions, Reaction, ReactionProject } from "@/lib/reactions-rules";

type Raw = Partial<Record<ReactionProject, Partial<Record<Reaction, string[]>>>>;

const keyOf = (project: ReactionProject, reaction: Reaction) => `react:${project}:${reaction}`;
const PAIRS = REACTION_PROJECTS.flatMap((p) => REACTIONS.map((r) => [p, r] as const));

async function loadRaw(): Promise<Raw> {
  if (!REDIS_ENABLED) return readJson<Raw>("reactions", {});
  const members = await redisPipeline<string[]>(PAIRS.map(([p, r]) => ["SMEMBERS", keyOf(p, r)]));
  const raw: Raw = {};
  PAIRS.forEach(([p, r], i) => {
    if (members[i]?.length) (raw[p] ??= {})[r] = members[i];
  });
  return raw;
}

/** Все проекты разом, глазами конкретного посетителя. */
export async function readReactions(viewer: string | null) {
  const raw = await loadRaw();
  const out = {} as Record<ReactionProject, ProjectReactions>;
  for (const p of REACTION_PROJECTS) {
    const counts: ProjectReactions["counts"] = {};
    const mine: Reaction[] = [];
    for (const r of REACTIONS) {
      const subs = raw[p]?.[r] ?? [];
      if (subs.length) counts[r] = subs.length;
      if (viewer && subs.includes(viewer)) mine.push(r);
    }
    out[p] = { counts, mine };
  }
  return out;
}

export async function setReaction(project: ReactionProject, reaction: Reaction, sub: string, on: boolean) {
  if (REDIS_ENABLED) {
    await redis([on ? "SADD" : "SREM", keyOf(project, reaction), sub]);
    return;
  }
  const raw = await readJson<Raw>("reactions", {});
  const subs = new Set(raw[project]?.[reaction] ?? []);
  if (on) subs.add(sub);
  else subs.delete(sub);
  (raw[project] ??= {})[reaction] = [...subs];
  await writeJson("reactions", raw);
}
