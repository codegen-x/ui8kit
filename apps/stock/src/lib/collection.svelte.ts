// The Collections and Compare of this device (lib/collection.ts), shared by every page, kept in localStorage on each change.
import { emptyShelf, readShelf, STORE_KEY, type Shelf } from "./collection";
import { readLocale, TEXTS } from "./i18n";
import { fmt } from "@ui8kit/layouts/stock/text";

/** the title of a new collection in the visitor's language ("Collection 1"); a person renames it */
export const titleFor = (n: number): string => fmt(TEXTS[readLocale()].collection.createdTitle, { n });

function load(): Shelf {
  let raw: string | null = null;
  try { raw = localStorage.getItem(STORE_KEY); } catch { /* storage blocked: this visit only */ }
  return readShelf(raw, () => emptyShelf(titleFor(1), new Date()));
}

export const shelf = $state<{ value: Shelf }>({ value: load() });

export function keep(next: Shelf): void {
  shelf.value = next;
  try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch { /* storage blocked: this visit only */ }
}
