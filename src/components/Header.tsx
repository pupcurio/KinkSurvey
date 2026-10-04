import Link from "next/link";
import { LOCALES, LOCALE_CODES, type Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";

export function Header({ lang, t }: { lang: Locale; t: Messages["nav"] }) {
  return (
    <header className="border-b border-line">
      <nav className="mx-auto flex max-w-2xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-sm">
        <Link href={`/${lang}`} className="font-display text-lg font-semibold text-plum">
          🌶️ {t.home}
        </Link>
        <span className="flex-1" />
        <Link href={`/${lang}/archetypes`} className="text-muted hover:text-text">
          {t.archetypes}
        </Link>
        <Link href={`/${lang}/privacy`} className="text-muted hover:text-text">
          {t.privacy}
        </Link>
        <span className="flex gap-2" aria-label={t.language}>
          {LOCALE_CODES.map((code) => (
            <Link
              key={code}
              href={`/${code}`}
              hrefLang={code}
              lang={code}
              aria-current={code === lang ? "true" : undefined}
              className={code === lang ? "font-semibold" : "text-muted hover:text-text"}
              title={LOCALES[code].name}
            >
              {code.toUpperCase()}
            </Link>
          ))}
        </span>
      </nav>
    </header>
  );
}
