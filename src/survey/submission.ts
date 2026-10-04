// Validates a submitted response and derives what we store. Pure, so it can be unit tested.

import { createHash } from "node:crypto";
import { isLocale } from "@/i18n/config";
import { QUESTIONS, SURVEY_VERSION, isAnswerValid, type Answers } from "./questions";
import { normalizeCode } from "./returningCode";

/** Faster than this is not a real read-through of ~40 questions. */
export const MIN_SECONDS = 90;

export type SubmissionBody = {
  locale: string;
  answers: Answers;
  returningCode?: string | null;
  durationSeconds: number;
  website?: string; // honeypot, must stay empty
};

export type StoredResponse = {
  surveyVersion: number;
  locale: string;
  submittedMonth: string; // YYYY-MM, deliberately no finer timestamp
  answers: Answers;
  returningHash: string | null;
  qualityFlags: string[];
};

export type ValidationResult =
  | { kind: "store"; response: StoredResponse }
  | { kind: "discard" } // bot: pretend success, store nothing
  | { kind: "invalid"; error: string };

export function validateSubmission(body: unknown, now = new Date()): ValidationResult {
  if (typeof body !== "object" || body === null) return { kind: "invalid", error: "body" };
  const b = body as Partial<SubmissionBody>;

  if (b.website) return { kind: "discard" };
  if (typeof b.locale !== "string" || !isLocale(b.locale)) return { kind: "invalid", error: "locale" };
  if (typeof b.durationSeconds !== "number" || !Number.isFinite(b.durationSeconds)) {
    return { kind: "invalid", error: "durationSeconds" };
  }
  if (typeof b.answers !== "object" || b.answers === null) return { kind: "invalid", error: "answers" };

  const answers: Answers = {};
  for (const q of QUESTIONS) {
    const value = (b.answers as Record<string, unknown>)[q.id];
    if (!isAnswerValid(q, value)) return { kind: "invalid", error: `answer:${q.id}` };
    answers[q.id] = value as string | number;
  }
  if (Object.keys(b.answers).length !== QUESTIONS.length) return { kind: "invalid", error: "unknown answers" };

  let returningHash: string | null = null;
  if (b.returningCode != null) {
    const code = normalizeCode(String(b.returningCode));
    if (!code) return { kind: "invalid", error: "returningCode" };
    returningHash = createHash("sha256").update(code).digest("hex");
  }

  return {
    kind: "store",
    response: {
      surveyVersion: SURVEY_VERSION,
      locale: b.locale,
      submittedMonth: now.toISOString().slice(0, 7),
      answers,
      returningHash,
      qualityFlags: qualityFlags(answers, b.durationSeconds),
    },
  };
}

function qualityFlags(answers: Answers, durationSeconds: number): string[] {
  const flags: string[] = [];
  if (durationSeconds < MIN_SECONDS) flags.push("too_fast");
  for (const q of QUESTIONS) {
    if (q.type === "likert" && q.attentionCheck !== undefined && answers[q.id] !== q.attentionCheck) {
      flags.push("attention_failed");
    }
  }
  const core = QUESTIONS.filter((q) => q.type === "likert" && q.dimension).map((q) => answers[q.id]);
  if (new Set(core).size === 1) flags.push("straightlined");
  return flags;
}
