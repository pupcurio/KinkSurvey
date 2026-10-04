"use client";

import { useMemo } from "react";
import { COUNTRY_CODES } from "@/survey/countries";
import { ACTIVITY_OPTIONS, LIKERT_VALUES, type Question } from "@/survey/questions";
import type { Messages } from "@/i18n/messages";

type Props = {
  question: Question;
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  missing: boolean;
  lang: string;
  t: Messages;
};

type QuestionText = { text: string; options?: Record<string, string> };

export function QuestionField({ question, value, onChange, missing, lang, t }: Props) {
  const text = (t.questions as Record<string, QuestionText>)[question.id];
  const name = question.id;

  return (
    <fieldset
      className={`rounded-2xl border bg-surface p-4 ${missing ? "border-accent" : "border-line"}`}
      aria-invalid={missing || undefined}
    >
      <legend className="sr-only">{text.text}</legend>
      <p className="mb-3 font-medium" aria-hidden>
        {text.text}
      </p>

      {question.type === "single" && (
        <div className="grid gap-2">
          {question.options.map((opt) => (
            <Choice key={opt} name={name} checked={value === opt} onSelect={() => onChange(opt)}>
              {text.options?.[opt]}
            </Choice>
          ))}
        </div>
      )}

      {question.type === "country" && <CountrySelect value={value} onChange={onChange} lang={lang} t={t} />}

      {question.type === "likert" && (
        <div className="grid grid-cols-5 gap-1.5">
          {LIKERT_VALUES.map((v) => (
            <Choice key={v} name={name} checked={value === v} onSelect={() => onChange(v)} compact>
              {t.likert[String(v) as keyof Messages["likert"]]}
            </Choice>
          ))}
        </div>
      )}

      {question.type === "activity" && (
        <div className="grid grid-cols-3 gap-1.5">
          {ACTIVITY_OPTIONS.map((opt) => (
            <Choice key={opt} name={name} checked={value === opt} onSelect={() => onChange(opt)} compact>
              {t.activity[opt]}
            </Choice>
          ))}
        </div>
      )}

      {question.type === "scale5" && (
        <>
          <div className="grid grid-cols-5 gap-1.5">
            {LIKERT_VALUES.map((v) => (
              <Choice key={v} name={name} checked={value === v} onSelect={() => onChange(v)} compact>
                {v}
              </Choice>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-xs text-muted">
            <span>{t.scale5["1"]}</span>
            <span>{t.scale5["5"]}</span>
          </div>
        </>
      )}
    </fieldset>
  );
}

function Choice({
  name,
  checked,
  onSelect,
  compact,
  children,
}: {
  name: string;
  checked: boolean;
  onSelect: () => void;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center rounded-xl border border-line transition-colors hover:border-accent has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--focus)] ${
        compact ? "min-h-12 justify-center px-1 py-2 text-center text-xs leading-tight sm:text-sm" : "px-3 py-2.5"
      }`}
    >
      <input type="radio" name={name} checked={checked} onChange={onSelect} className="sr-only" />
      {children}
    </label>
  );
}

function CountrySelect({
  value,
  onChange,
  lang,
  t,
}: {
  value: string | number | undefined;
  onChange: (value: string) => void;
  lang: string;
  t: Messages;
}) {
  const countries = useMemo(() => {
    const names = new Intl.DisplayNames([lang], { type: "region" });
    return COUNTRY_CODES.map((code) => ({ code, name: names.of(code) ?? code })).sort((a, b) =>
      a.name.localeCompare(b.name, lang),
    );
  }, [lang]);

  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-line bg-surface px-3 py-2.5"
    >
      <option value="" disabled>
        {t.survey.selectCountry}
      </option>
      <option value="prefer_not_to_say">{t.survey.preferNotToSay}</option>
      {countries.map((c) => (
        <option key={c.code} value={c.code}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
