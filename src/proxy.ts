import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALE_CODES } from "@/i18n/config";

// Sends visitors without a locale in the URL to their browser language.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = LOCALE_CODES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return;

  request.nextUrl.pathname = `/${pickLocale(request.headers.get("accept-language"))}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

function pickLocale(acceptLanguage: string | null): string {
  const preferred = (acceptLanguage ?? "")
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return preferred.find((p) => (LOCALE_CODES as string[]).includes(p.lang))?.lang ?? DEFAULT_LOCALE;
}

export const config = {
  // Skip API routes, Next internals and files with an extension (favicon.ico, etc.).
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
