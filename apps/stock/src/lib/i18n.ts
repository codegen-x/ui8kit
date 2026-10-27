// The interface texts of Stock in five languages (content/i18n/<locale>.json, data: rule 06) and the chosen language, kept on this
// device. Ids and URL parameters stay English; only labels change.
import type { StockText } from "@ui8kit/layouts/stock/text";
import { LOCALES, type Locale } from "@ui8kit/facet-search/model";
import de from "../../content/i18n/de.json";
import en from "../../content/i18n/en.json";
import es from "../../content/i18n/es.json";
import fr from "../../content/i18n/fr.json";
import list from "../../content/i18n/locales.json";
import ru from "../../content/i18n/ru.json";

export const TEXTS: Record<Locale, StockText> = { en, fr, de, es, ru };
export const LOCALE_OPTIONS: { id: string; label: string }[] = list.locales;
const KEY = "stock:v1:locale";

export const isLocale = (v: unknown): v is Locale => typeof v === "string" && (LOCALES as readonly string[]).includes(v);

/** the saved language, else the browser's (its primary subtag), else English */
export function readLocale(): Locale {
  try { const saved = localStorage.getItem(KEY); if (isLocale(saved)) return saved; } catch { /* storage blocked */ }
  const nav = typeof navigator === "undefined" ? "" : navigator.language.slice(0, 2).toLowerCase();
  return isLocale(nav) ? nav : (list.default as Locale);
}
export function writeLocale(l: Locale): void {
  try { localStorage.setItem(KEY, l); } catch { /* storage blocked: this visit only */ }
}
