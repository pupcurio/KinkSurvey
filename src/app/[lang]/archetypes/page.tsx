import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { ARCHETYPES, ARCHETYPE_EMOJI } from "@/survey/scoring";

export default async function ArchetypesPage({ params }: PageProps<"/[lang]/archetypes">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getMessages(lang);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">{t.gallery.title}</h1>
      <p className="text-muted">{t.gallery.intro}</p>
      <ul className="grid gap-4 sm:grid-cols-2">
        {ARCHETYPES.map((id) => (
          <li key={id} id={id} className="scroll-mt-4 rounded-2xl border border-line bg-surface p-5 target:border-accent">
            <div className="text-3xl" aria-hidden>
              {ARCHETYPE_EMOJI[id]}
            </div>
            <h2 className="mt-2 font-display text-xl font-semibold">{t.archetypes[id].name}</h2>
            <p className="mt-1 text-sm text-muted">{t.archetypes[id].description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
