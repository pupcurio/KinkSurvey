// Turns answers into the fun result. Runs in the browser; the result is never stored.

import { CATEGORIES, DIMENSIONS, QUESTIONS, type Answers, type Category, type Dimension } from "./questions";

export const ARCHETYPES = [
  "vanilla",
  "firecracker",
  "switch",
  "explorer",
  "lead",
  "follower",
  "sensation",
  "storyteller",
  "spotlight",
] as const;
export type Archetype = (typeof ARCHETYPES)[number];

export const ARCHETYPE_EMOJI: Record<Archetype, string> = {
  vanilla: "🍦",
  firecracker: "🔥",
  switch: "🔄",
  explorer: "🧭",
  lead: "🎩",
  follower: "🎀",
  sensation: "⚡",
  storyteller: "🎭",
  spotlight: "🔦",
};

const TOP_DIMENSION_ARCHETYPE: Record<Dimension, Archetype> = {
  curiosity: "explorer",
  lead: "lead",
  follow: "follower",
  sensation: "sensation",
  fantasy: "storyteller",
  exhibition: "spotlight",
};

export type InterestStatus = "explored" | "curious" | "not_for_me";

export type Result = {
  dimensions: Record<Dimension, number>; // 0–100
  spiceLevel: number; // 0–100
  archetype: Archetype;
  interests: Record<Category, InterestStatus>;
};

const ACTIVITY_POINTS: Record<string, number> = { tried: 1, curious: 0.5, not_for_me: 0 };

export function computeResult(answers: Answers): Result {
  const dimensions = {} as Record<Dimension, number>;
  for (const d of DIMENSIONS) {
    const values = QUESTIONS.filter((q) => q.type === "likert" && q.dimension === d).map((q) => Number(answers[q.id]));
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    dimensions[d] = Math.round(((mean - 1) / 4) * 100);
  }

  const activities = QUESTIONS.filter((q) => q.type === "activity");
  const activityScore =
    (activities.reduce((sum, q) => sum + (ACTIVITY_POINTS[String(answers[q.id])] ?? 0), 0) / activities.length) * 100;
  const dimensionAvg = DIMENSIONS.reduce((sum, d) => sum + dimensions[d], 0) / DIMENSIONS.length;
  const spiceLevel = Math.round(0.6 * dimensionAvg + 0.4 * activityScore);

  const interests = {} as Record<Category, InterestStatus>;
  for (const c of CATEGORIES) {
    const values = activities.filter((q) => q.type === "activity" && q.category === c).map((q) => answers[q.id]);
    interests[c] = values.includes("tried") ? "explored" : values.includes("curious") ? "curious" : "not_for_me";
  }

  return { dimensions, spiceLevel, archetype: pickArchetype(dimensions, spiceLevel), interests };
}

export function pickArchetype(dimensions: Record<Dimension, number>, spiceLevel: number): Archetype {
  if (spiceLevel < 20) return "vanilla";
  if (spiceLevel >= 80) return "firecracker";
  if (dimensions.lead >= 60 && dimensions.follow >= 60 && Math.abs(dimensions.lead - dimensions.follow) <= 15) {
    return "switch";
  }
  // Ties go to the earlier dimension in DIMENSIONS.
  const top = DIMENSIONS.reduce((best, d) => (dimensions[d] > dimensions[best] ? d : best));
  return TOP_DIMENSION_ARCHETYPE[top];
}
