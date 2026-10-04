import { index, integer, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";

// No timestamp column on purpose: submitted_month is the finest time resolution we keep,
// so a response cannot be matched to anything else by its exact time (docs/DESIGN.md §7).
export const responses = pgTable(
  "responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    surveyVersion: integer("survey_version").notNull(),
    locale: text("locale").notNull(),
    submittedMonth: text("submitted_month").notNull(),
    answers: jsonb("answers").$type<Record<string, string | number>>().notNull(),
    returningHash: text("returning_hash"),
    qualityFlags: jsonb("quality_flags").$type<string[]>().notNull(),
  },
  (t) => [index("responses_month_idx").on(t.submittedMonth), index("responses_returning_idx").on(t.returningHash)],
);
