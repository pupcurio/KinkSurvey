import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

export default async function PrivacyPage({ params }: PageProps<"/[lang]/privacy">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = (await getMessages(lang)).privacy;

  return (
    <article className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">{t.title}</h1>
      <p className="rounded-xl bg-accent-soft p-3 text-sm">{t.draftNotice}</p>
      {Object.entries(t.sections).map(([key, section]) => (
        <section key={key}>
          <h2 className="mb-1 font-semibold">{section.title}</h2>
          <p className="text-muted">{section.body}</p>
        </section>
      ))}
    </article>
  );
}
