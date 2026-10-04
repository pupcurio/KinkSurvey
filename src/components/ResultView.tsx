"use client";

import Link from "next/link";
import { useState } from "react";
import { fill } from "@/i18n/format";
import type { Messages } from "@/i18n/messages";
import { CATEGORIES, DIMENSIONS } from "@/survey/questions";
import { ARCHETYPE_EMOJI, type Result } from "@/survey/scoring";
import { CodeSaver } from "./CodeSaver";
import { RadarChart } from "./RadarChart";

const STATUS_STYLE = {
  explored: "bg-accent text-accent-text",
  curious: "bg-accent-soft",
  not_for_me: "border border-line text-muted",
};

export function ResultView({
  result,
  code,
  codeIsNew,
  submitError,
  lang,
  t,
}: {
  result: Result;
  code: string | null;
  codeIsNew: boolean;
  submitError: boolean;
  lang: string;
  t: Messages;
}) {
  const [copied, setCopied] = useState(false);
  const archetype = t.archetypes[result.archetype];
  const homeUrl = `${window.location.origin}/${lang}`;

  async function share() {
    const text = fill(t.result.shareText, { archetype: archetype.name });
    if (navigator.share) {
      try {
        await navigator.share({ title: "Spice Census", text, url: homeUrl });
      } catch {
        // Share sheet dismissed.
      }
    } else {
      await navigator.clipboard.writeText(`${text} ${homeUrl}`);
      setCopied(true);
    }
  }

  return (
    <div className="space-y-8">
      {submitError && <p className="rounded-xl bg-accent-soft p-3 text-sm">{t.survey.submitError}</p>}

      <section className="space-y-3 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-accent">{t.result.kicker}</p>
        <div className="text-6xl" aria-hidden>
          {ARCHETYPE_EMOJI[result.archetype]}
        </div>
        <h1 className="font-display text-4xl font-semibold">{archetype.name}</h1>
        <p className="text-muted">{archetype.description}</p>
        <div className="mx-auto max-w-sm pt-2">
          <div className="mb-1 flex justify-between text-sm">
            <span>{t.result.spiceLevel}</span>
            <span className="font-semibold">{result.spiceLevel} / 100</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-accent-soft" aria-hidden>
            <div className="h-full rounded-full bg-accent" style={{ width: `${result.spiceLevel}%` }} />
          </div>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <button onClick={share} className="rounded-full bg-accent px-5 py-2 font-semibold text-accent-text">
            {copied ? t.result.copied : t.result.share}
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="mb-2 font-display text-xl font-semibold">{t.result.profileTitle}</h2>
        <RadarChart values={result.dimensions} order={DIMENSIONS} labels={t.dimensions} />
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="font-display text-xl font-semibold">{t.result.interestsTitle}</h2>
        <p className="mb-3 text-sm text-muted">{t.result.interestsIntro}</p>
        <ul className="space-y-2">
          {CATEGORIES.map((c) => (
            <li key={c} className="flex items-center justify-between gap-3">
              <span>{t.categories[c]}</span>
              <span className={`rounded-full px-3 py-0.5 text-sm ${STATUS_STYLE[result.interests[c]]}`}>
                {t.interests[result.interests[c]]}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {code && <CodeSaver code={code} isNew={codeIsNew} surveyUrl={homeUrl} t={t.code} />}

      <section className="space-y-2 rounded-2xl bg-accent-soft p-5 text-center">
        <p>{t.result.allArchetypesHint}</p>
        <Link href={`/${lang}/archetypes#${result.archetype}`} className="font-semibold text-plum underline underline-offset-4">
          {t.result.allArchetypes}
        </Link>
      </section>

      <p className="text-center text-sm text-muted">{t.result.thanks}</p>
    </div>
  );
}
