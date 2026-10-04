import "server-only";
import en from "../../messages/en.json";
import { LOCALES, type Locale } from "./config";

export type Messages = typeof en;

type Tree = { [key: string]: string | Tree };

function mergeFallback(base: Tree, override: Tree): Tree {
  const out: Tree = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const baseValue = base[key];
    out[key] =
      typeof value === "object" && typeof baseValue === "object" ? mergeFallback(baseValue, value) : value;
  }
  return out;
}

export async function getMessages(locale: Locale): Promise<Messages> {
  const messages = (await LOCALES[locale].load()).default as Tree;
  return mergeFallback(en as Tree, messages) as Messages;
}
