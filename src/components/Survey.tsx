"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fill } from "@/i18n/format";
import type { Messages } from "@/i18n/messages";
import { SECTIONS, type Answers } from "@/survey/questions";
import { formatCode, generateCode, normalizeCode } from "@/survey/returningCode";
import { computeResult, type Result } from "@/survey/scoring";
import { CREDENTIAL_USERNAME } from "./CodeSaver";
import { QuestionField } from "./QuestionField";
import { ResultView } from "./ResultView";

type Step = "gate" | "under18" | "consent" | number | "returning" | "result";
type ReturningMode = "off" | "new" | "existing";

const STORAGE_KEY = "spiceCensusCode";

function readStoredCode(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function Survey({ lang, t }: { lang: string; t: Messages }) {
  const [step, setStep] = useState<Step>("gate");
  const [consented, setConsented] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showMissing, setShowMissing] = useState(false);

  const [returningMode, setReturningMode] = useState<ReturningMode>("off");
  const [codeInput, setCodeInput] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [remember, setRemember] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [finalCode, setFinalCode] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  const totalSteps = SECTIONS.length + 1;
  const codeInvalid = returningMode === "existing" && normalizeCode(codeInput) === null;

  function goNext(sectionIndex: number) {
    const unanswered = SECTIONS[sectionIndex].questions.some((q) => answers[q.id] === undefined);
    if (unanswered) {
      setShowMissing(true);
      return;
    }
    setShowMissing(false);
    if (sectionIndex + 1 < SECTIONS.length) {
      setStep(sectionIndex + 1);
      return;
    }
    // Prefill a code remembered on this device.
    const stored = readStoredCode();
    if (stored && !codeInput) {
      setReturningMode("existing");
      setCodeInput(stored);
      setRemember(true);
    }
    setStep("returning");
  }

  async function submit() {
    if (codeInvalid) {
      setShowMissing(true);
      return;
    }
    setSubmitting(true);

    let code: string | null = null;
    if (returningMode === "new") code = generateCode();
    if (returningMode === "existing") code = formatCode(normalizeCode(codeInput)!);

    let failed = false;
    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale: lang,
          answers,
          returningCode: code,
          durationSeconds: Math.round((Date.now() - startedAt) / 1000),
          website: honeypot,
        }),
      });
      failed = !res.ok;
    } catch {
      failed = true;
    }

    try {
      if (code && remember) localStorage.setItem(STORAGE_KEY, code);
      if (!remember) localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage blocked: the other ways of keeping the code still work.
    }

    setSubmitError(failed);
    setFinalCode(code);
    setResult(computeResult(answers));
    setSubmitting(false);
    setStep("result");
  }

  const primary = "rounded-full bg-accent px-6 py-3 font-semibold text-accent-text hover:opacity-90 disabled:opacity-50";
  const secondary = "rounded-full border border-line px-6 py-3 hover:border-accent";

  if (step === "result") {
    if (!result) return null;
    return (
      <ResultView
        result={result}
        code={finalCode}
        codeIsNew={returningMode === "new"}
        submitError={submitError}
        lang={lang}
        t={t}
      />
    );
  }

  if (step === "gate") {
    return (
      <div className="space-y-6 pt-6">
        <h1 className="font-display text-3xl font-semibold">{t.gate.title}</h1>
        <p className="text-lg">{t.gate.question}</p>
        <div className="flex flex-wrap gap-3">
          <button className={primary} onClick={() => setStep("consent")}>
            {t.gate.yes}
          </button>
          <button className={secondary} onClick={() => setStep("under18")}>
            {t.gate.no}
          </button>
        </div>
      </div>
    );
  }

  if (step === "under18") {
    return (
      <div className="space-y-4 pt-6">
        <h1 className="font-display text-3xl font-semibold">{t.gate.under18Title}</h1>
        <p className="text-muted">{t.gate.under18}</p>
      </div>
    );
  }

  if (step === "consent") {
    return (
      <div className="space-y-6 pt-6">
        <h1 className="font-display text-3xl font-semibold">{t.consent.title}</h1>
        <p className="leading-relaxed text-muted">{t.consent.body}</p>
        <Link href={`/${lang}/privacy`} target="_blank" className="text-plum underline underline-offset-4">
          {t.consent.privacyLink}
        </Link>
        <label className="flex cursor-pointer gap-3 rounded-2xl border border-line bg-surface p-4">
          <input
            type="checkbox"
            checked={consented}
            onChange={(e) => setConsented(e.target.checked)}
            className="mt-1 size-5 accent-[var(--accent)]"
          />
          <span>{t.consent.checkbox}</span>
        </label>
        <button
          className={primary}
          disabled={!consented}
          onClick={() => {
            setStartedAt(Date.now());
            setStep(0);
          }}
        >
          {t.consent.continue}
        </button>
      </div>
    );
  }

  const stepNumber = step === "returning" ? totalSteps : step + 1;
  const sectionId = step === "returning" ? "returning" : SECTIONS[step].id;
  const sectionText = t.sections[sectionId as keyof Messages["sections"]];

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm text-muted">{fill(t.survey.progress, { current: stepNumber, total: totalSteps })}</p>
        <div className="h-1.5 overflow-hidden rounded-full bg-accent-soft" aria-hidden>
          <div className="h-full bg-accent transition-all" style={{ width: `${(stepNumber / totalSteps) * 100}%` }} />
        </div>
      </div>

      <header className="space-y-1">
        <h1 className="font-display text-2xl font-semibold">{sectionText.title}</h1>
        <p className="text-muted">{sectionText.intro}</p>
      </header>

      {typeof step === "number" ? (
        <div className="space-y-4">
          {SECTIONS[step].questions.map((q) => (
            <QuestionField
              key={q.id}
              question={q}
              value={answers[q.id]}
              onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
              missing={showMissing && answers[q.id] === undefined}
              lang={lang}
              t={t}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-2">
            {(["off", "new", "existing"] as const).map((mode) => (
              <label
                key={mode}
                className="flex cursor-pointer items-center rounded-xl border border-line bg-surface px-3 py-2.5 hover:border-accent has-[:checked]:border-accent has-[:checked]:bg-accent-soft"
              >
                <input
                  type="radio"
                  name="returning"
                  checked={returningMode === mode}
                  onChange={() => setReturningMode(mode)}
                  className="sr-only"
                />
                {t.returning[mode]}
              </label>
            ))}
          </div>

          {returningMode === "new" && <p className="text-sm text-muted">{t.returning.newHint}</p>}

          {returningMode === "existing" && (
            <div className="space-y-2">
              <label htmlFor="returning-code" className="block font-medium">
                {t.returning.codeLabel}
              </label>
              {/* Lets password managers match the saved code to this field. */}
              <input type="text" autoComplete="username" value={CREDENTIAL_USERNAME} readOnly className="sr-only" tabIndex={-1} aria-hidden />
              <div className="flex gap-2">
                <input
                  id="returning-code"
                  type={showCode ? "text" : "password"}
                  autoComplete="current-password"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder={t.returning.codePlaceholder}
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 font-mono uppercase tracking-widest"
                  aria-invalid={(showMissing && codeInvalid) || undefined}
                />
                <button type="button" onClick={() => setShowCode((s) => !s)} className="rounded-xl border border-line px-3" aria-label={t.returning.showCode}>
                  {showCode ? "🙈" : "👁️"}
                </button>
              </div>
              {showMissing && codeInvalid && <p className="text-sm text-accent">{t.returning.invalid}</p>}
            </div>
          )}

          {returningMode !== "off" && (
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="mt-0.5 size-4 accent-[var(--accent)]"
              />
              <span>{t.returning.remember}</span>
            </label>
          )}

          {/* Honeypot: invisible to people, bots tend to fill it in. */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            className="absolute -left-[9999px] h-0 w-0 opacity-0"
          />
        </div>
      )}

      {showMissing && typeof step === "number" && <p className="text-sm text-accent">{t.survey.required}</p>}

      <div className="flex justify-between gap-3">
        <button
          className={secondary}
          onClick={() => {
            setShowMissing(false);
            setStep(step === "returning" ? SECTIONS.length - 1 : step === 0 ? "consent" : (step as number) - 1);
          }}
        >
          {t.survey.back}
        </button>
        {typeof step === "number" ? (
          <button className={primary} onClick={() => goNext(step)}>
            {t.survey.next}
          </button>
        ) : (
          <button className={primary} onClick={submit} disabled={submitting}>
            {submitting ? t.survey.submitting : t.survey.submit}
          </button>
        )}
      </div>
    </div>
  );
}
