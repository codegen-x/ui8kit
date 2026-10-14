// The words of the feed: the label of every value of every axis of the tune, and the "why" line of a card (content/ui.json).
import ui from "../../content/ui.json";
import type { Axis, Fonts, Tune } from "../lib/feed";

const N = ui.feed.names;
const name = (table: Record<string, string>, v: string): string => table[v] ?? v;

/** the label of one value of an axis */
export function valueLabel(axis: keyof Tune, v: string): string {
  if (axis === "comp") return name(ui.style.families, v);
  if (axis === "character") return name(N.character, v);
  if (axis === "density") return name(N.density, v);
  if (axis === "task") return name(N.task, v);
  if (axis === "media") return name(N.media, v);
  if (axis === "radius") return `${v} px`;
  return v;
}
export const fontLabel = (f: Fonts): string => (f.display === f.body ? f.display : `${f.display} + ${f.body}`);

/** the values of an axis of a tune as one line */
export function axisLine(tune: Tune, axis: keyof Tune): string {
  const v = tune[axis];
  if (axis === "font") return fontLabel(v as Fonts);
  const list = Array.isArray(v) ? v.map(String) : [String(v)];
  return list.map((x) => valueLabel(axis, x)).join(", ");
}

/** "Why: same layout family, same character" (the first two axes a card matches); "" when none */
export const whyText = (why: readonly Axis[]): string =>
  why.length ? ui.feed.whyLead + why.slice(0, 2).map((a) => ui.feed.why[a]).join(", ") : "";
