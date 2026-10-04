import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import en from "../messages/en.json";
import { LOCALE_CODES } from "@/i18n/config";
import { ARCHETYPES } from "@/survey/scoring";
import { CATEGORIES, DIMENSIONS, QUESTIONS } from "@/survey/questions";

type Tree = { [key: string]: string | Tree };

function keys(tree: Tree, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([k, v]) => (typeof v === "string" ? [prefix + k] : keys(v, `${prefix}${k}/`)));
}

describe("translations", () => {
  it("English has a text for every question, option, archetype, dimension and category", () => {
    const enKeys = new Set(keys(en as Tree));
    for (const q of QUESTIONS) {
      expect(enKeys).toContain(`questions/${q.id}/text`);
      if (q.type === "single") for (const o of q.options) expect(enKeys).toContain(`questions/${q.id}/options/${o}`);
    }
    for (const a of ARCHETYPES) expect(enKeys).toContain(`archetypes/${a}/name`);
    for (const d of DIMENSIONS) expect(enKeys).toContain(`dimensions/${d}`);
    for (const c of CATEGORIES) expect(enKeys).toContain(`categories/${c}`);
  });

  // Missing keys fall back to English at runtime; this keeps shipped locales complete
  // and catches keys that no longer exist in English.
  it.each(LOCALE_CODES.filter((l) => l !== "en"))("%s matches the English keys", (locale) => {
    const other = JSON.parse(readFileSync(`messages/${locale}.json`, "utf8")) as Tree;
    expect(keys(other).sort()).toEqual(keys(en as Tree).sort());
  });
});
