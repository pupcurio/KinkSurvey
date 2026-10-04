import { notFound } from "next/navigation";
import { Survey } from "@/components/Survey";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

export default async function SurveyPage({ params }: PageProps<"/[lang]/survey">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <Survey lang={lang} t={await getMessages(lang)} />;
}
