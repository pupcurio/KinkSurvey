"use client";

import { useState } from "react";
import { fill } from "@/i18n/format";
import type { Messages } from "@/i18n/messages";

// Every way of keeping the code runs on the participant's side. The server never sends it
// anywhere, so no email log or sent folder can link an address to a code (docs/DESIGN.md §6).

export const CREDENTIAL_USERNAME = "spice-census";

type PasswordCredentialCtor = new (data: { id: string; password: string; name?: string }) => Credential;

export function CodeSaver({ code, isNew, surveyUrl, t }: { code: string; isNew: boolean; surveyUrl: string; t: Messages["code"] }) {
  const [copied, setCopied] = useState(false);
  const [stored, setStored] = useState(false);

  const mailto = `mailto:?subject=${encodeURIComponent(t.emailSubject)}&body=${encodeURIComponent(
    fill(t.emailBody, { code, url: surveyUrl }),
  )}`;

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
  }

  function download() {
    const blob = new Blob([fill(t.fileText, { code, url: surveyUrl })], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "spice-census-code.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // Chrome/Edge support the Credential Management API. Other browsers usually offer to
  // save when a form with a password field is submitted, which is why this is a form.
  async function storeInPasswordManager(e: React.FormEvent) {
    e.preventDefault();
    const Ctor = (window as unknown as { PasswordCredential?: PasswordCredentialCtor }).PasswordCredential;
    if (Ctor) {
      try {
        await navigator.credentials.store(new Ctor({ id: CREDENTIAL_USERNAME, password: code, name: "Spice Census" }));
      } catch {
        // Declined or unsupported: nothing else to do.
      }
    }
    setStored(true);
  }

  const button = "rounded-full border border-line px-4 py-2 text-sm hover:border-accent";

  return (
    <section className="space-y-3 rounded-2xl border-2 border-dashed border-accent bg-surface p-5">
      <h2 className="font-display text-xl font-semibold">{t.title}</h2>
      <p className="text-sm text-muted">{isNew ? t.intro : t.existingIntro}</p>
      <p className="select-all text-center font-mono text-2xl tracking-widest">{code}</p>
      {isNew && (
        <>
          <form onSubmit={storeInPasswordManager} className="flex flex-wrap justify-center gap-2">
            <input type="text" name="username" autoComplete="username" value={CREDENTIAL_USERNAME} readOnly className="sr-only" tabIndex={-1} aria-hidden />
            <input type="password" name="password" autoComplete="new-password" value={code} readOnly className="sr-only" tabIndex={-1} aria-hidden />
            <button type="button" onClick={copy} className={button}>
              {copied ? t.copied : t.copy}
            </button>
            <a href={mailto} className={button}>
              {t.email}
            </a>
            <button type="submit" className={button}>
              {t.passwordManager}
            </button>
            <button type="button" onClick={download} className={button}>
              {t.download}
            </button>
          </form>
          {stored && <p className="text-center text-sm text-muted">{t.passwordManagerDone}</p>}
          <p className="text-xs text-muted">{t.emailHint}</p>
        </>
      )}
    </section>
  );
}
