// The Spice Census questionnaire. Hard-coded on purpose (see docs/DESIGN.md §5).
//
// FREEZE RULE: once launched, never change or remove a question or option ID.
// A wording change means a new question with a new ID, a SURVEY_VERSION bump and
// an entry in docs/questionnaire/CHANGELOG.md. Display text lives in messages/*.json.

import { COUNTRY_CODES } from "./countries";

export const SURVEY_VERSION = 1;

export type Dimension = "curiosity" | "lead" | "follow" | "sensation" | "fantasy" | "exhibition";
export const DIMENSIONS: Dimension[] = ["curiosity", "lead", "follow", "sensation", "fantasy", "exhibition"];

export type Category = "bdsm" | "sensation" | "verbal" | "roleplay" | "toys" | "exhibition" | "relationship";
export const CATEGORIES: Category[] = ["bdsm", "sensation", "verbal", "roleplay", "toys", "exhibition", "relationship"];

export type Question =
  | { id: string; type: "single"; options: string[] }
  | { id: string; type: "country" }
  | { id: string; type: "likert"; dimension?: Dimension; attentionCheck?: number }
  | { id: string; type: "activity"; category: Category }
  | { id: string; type: "scale5" };

export type Section = { id: string; questions: Question[] };

const PNTS = "prefer_not_to_say";

export const LIKERT_VALUES = [1, 2, 3, 4, 5] as const;
export const ACTIVITY_OPTIONS = ["tried", "curious", "not_for_me"] as const;

export const SECTIONS: Section[] = [
  {
    id: "about",
    questions: [
      { id: "demo.age", type: "single", options: ["18_24", "25_34", "35_44", "45_54", "55_64", "65_plus", PNTS] },
      { id: "demo.gender", type: "single", options: ["woman", "man", "non_binary", "other", PNTS] },
      { id: "demo.trans", type: "single", options: ["yes", "no", PNTS] },
      {
        id: "demo.orientation",
        type: "single",
        options: ["heterosexual", "gay_lesbian", "bi_pan", "asexual", "queer_other", PNTS],
      },
      { id: "demo.relationship", type: "single", options: ["single", "monogamous", "non_monogamous", PNTS] },
      { id: "demo.country", type: "country" },
      { id: "demo.community", type: "single", options: ["none", "online", "occasional", "active", PNTS] },
    ],
  },
  {
    id: "core1",
    questions: [
      { id: "core.curiosity.1", type: "likert", dimension: "curiosity" },
      { id: "core.lead.1", type: "likert", dimension: "lead" },
      { id: "core.follow.1", type: "likert", dimension: "follow" },
      { id: "core.sensation.1", type: "likert", dimension: "sensation" },
      { id: "core.fantasy.1", type: "likert", dimension: "fantasy" },
      { id: "core.exhibition.1", type: "likert", dimension: "exhibition" },
      { id: "core.curiosity.2", type: "likert", dimension: "curiosity" },
      { id: "core.lead.2", type: "likert", dimension: "lead" },
      { id: "core.follow.2", type: "likert", dimension: "follow" },
    ],
  },
  {
    id: "core2",
    questions: [
      { id: "core.sensation.2", type: "likert", dimension: "sensation" },
      { id: "core.fantasy.2", type: "likert", dimension: "fantasy" },
      { id: "core.exhibition.2", type: "likert", dimension: "exhibition" },
      { id: "check.attention", type: "likert", attentionCheck: 2 },
      { id: "core.curiosity.3", type: "likert", dimension: "curiosity" },
      { id: "core.lead.3", type: "likert", dimension: "lead" },
      { id: "core.follow.3", type: "likert", dimension: "follow" },
      { id: "core.sensation.3", type: "likert", dimension: "sensation" },
      { id: "core.fantasy.3", type: "likert", dimension: "fantasy" },
      { id: "core.exhibition.3", type: "likert", dimension: "exhibition" },
    ],
  },
  {
    id: "activities",
    questions: [
      { id: "act.bondage", type: "activity", category: "bdsm" },
      { id: "act.impact", type: "activity", category: "bdsm" },
      { id: "act.ds", type: "activity", category: "bdsm" },
      { id: "act.sensory", type: "activity", category: "sensation" },
      { id: "act.rough", type: "activity", category: "sensation" },
      { id: "act.dirty_talk", type: "activity", category: "verbal" },
      { id: "act.roleplay", type: "activity", category: "roleplay" },
      { id: "act.pet_play", type: "activity", category: "roleplay" },
      { id: "act.toys", type: "activity", category: "toys" },
      { id: "act.semi_public", type: "activity", category: "exhibition" },
      { id: "act.watching", type: "activity", category: "exhibition" },
      { id: "act.non_monogamy", type: "activity", category: "relationship" },
    ],
  },
  {
    id: "meta",
    questions: [
      { id: "meta.before", type: "single", options: ["no", "once", "several"] },
      { id: "meta.partner", type: "single", options: ["alone", "together", "separately"] },
      { id: "meta.source", type: "single", options: ["social", "friend", "community", "forum", "other"] },
      // Asked last, before the result, to compare self-image with the answers.
      { id: "meta.self_kinky", type: "scale5" },
    ],
  },
];

export const QUESTIONS: Question[] = SECTIONS.flatMap((s) => s.questions);

export type Answers = Record<string, string | number>;

/** Allowed answer values for a question. Every question is required. */
export function allowedValues(q: Question): readonly (string | number)[] {
  switch (q.type) {
    case "single":
      return q.options;
    case "country":
      return [...COUNTRY_CODES, PNTS];
    case "likert":
    case "scale5":
      return LIKERT_VALUES;
    case "activity":
      return ACTIVITY_OPTIONS;
  }
}

export function isAnswerValid(q: Question, value: unknown): boolean {
  return (allowedValues(q) as readonly unknown[]).includes(value);
}
