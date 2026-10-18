/**
 * Реакции на проекты — общие правила для клиента и сервера.
 */

export const REACTIONS = ["🔥", "🚀", "💡", "👀"] as const;
export type Reaction = (typeof REACTIONS)[number];

/**
 * На какие проекты можно реагировать — по title из projects-section.
 * Список держим здесь, а не берём из данных проектов: те живут в клиентском
 * модуле, а серверу нужно знать, какие ключи вообще допустимы.
 */
export const REACTION_PROJECTS = ["CRYPTOMIA", "GOSLING", "RPTBOT", "SOULCYCLE", "ZVONOCHEK"] as const;
export type ReactionProject = (typeof REACTION_PROJECTS)[number];

export const isReaction = (v: unknown): v is Reaction =>
  typeof v === "string" && (REACTIONS as readonly string[]).includes(v);

export const isReactionProject = (v: unknown): v is ReactionProject =>
  typeof v === "string" && (REACTION_PROJECTS as readonly string[]).includes(v);

/** Что видит посетитель: сколько каких реакций и какие из них его. */
export interface ProjectReactions {
  counts: Partial<Record<Reaction, number>>;
  mine: Reaction[];
}
