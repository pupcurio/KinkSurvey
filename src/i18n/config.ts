// To add a language: add messages/<code>.json (copy en.json) and one line here.
// Missing keys fall back to English, so a translation can be added piece by piece.
export const LOCALES = {
  en: { name: "English", load: () => import("../../messages/en.json") },
  de: { name: "Deutsch", load: () => import("../../messages/de.json") },
} as const;

export type Locale = keyof typeof LOCALES;
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_CODES = Object.keys(LOCALES) as Locale[];

export function isLocale(value: string): value is Locale {
  return Object.hasOwn(LOCALES, value);
}
