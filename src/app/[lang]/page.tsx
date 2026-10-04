import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

export default async function LandingPage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = (await getMessages(lang)).landing;

  return (
    <div className="space-y-8">
      <section className="space-y-4 pt-6">
        <p className="text-sm font-medium uppercase tracking-wide text-accent">{t.kicker}</p>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">{t.title}</h1>
        <p className="text-lg leading-relaxed text-muted">{t.intro}</p>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="mb-3 font-semibold">{t.pointsTitle}</h2>
        <ul className="list-disc space-y-2 pl-5 text-muted">
          <li>{t.point1}</li>
          <li>{t.point2}</li>
          <li>{t.point3}</li>
          <li>{t.point4}</li>
        </ul>
      </section>

      <p className="text-sm text-muted">{t.contentNote}</p>

      <div className="flex flex-wrap items-center gap-4">
        <Link
          href={`/${lang}/survey`}
          className="rounded-full bg-accent px-6 py-3 font-semibold text-accent-text hover:opacity-90"
        >
          {t.start}
        </Link>
        <Link href={`/${lang}/archetypes`} className="text-plum underline underline-offset-4">
          {t.seeArchetypes}
        </Link>
      </div>
    </div>
  );
}
