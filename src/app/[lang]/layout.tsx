import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Fraunces, Inter } from "next/font/google";
import { Header } from "@/components/Header";
import { LOCALE_CODES, isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import "../globals.css";

// next/font self-hosts the fonts, so visitors' browsers never contact Google.
const body = Inter({ variable: "--font-body", subsets: ["latin", "latin-ext"] });
const display = Fraunces({ variable: "--font-display", subsets: ["latin", "latin-ext"] });

export function generateStaticParams() {
  return LOCALE_CODES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getMessages(lang);
  return { title: t.meta.title, description: t.meta.description };
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getMessages(lang);

  return (
    <html lang={lang} className={`${body.variable} ${display.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Header lang={lang} t={t.nav} />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 pt-6">{children}</main>
      </body>
    </html>
  );
}
