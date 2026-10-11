// The "why" line of a recommended card (plan/MAGAZINE.md §6): the two score terms that carry the card, in plain English.
// The terms come from the recommender's own breakdown (`scoreStyle().why`, the two largest of weight × term, `included` never); this file
// only words them.
import type { Term } from "./weights";

/** the terms a card can show: every term of the score except `included` (a catalogue flag, not a taste signal) */
export const WHY_TERMS = ["colour", "pattern", "layout", "font", "radius", "recipe"] as const satisfies readonly Term[];
export type WhyTerm = (typeof WHY_TERMS)[number];

/** the phrase of a term (lower case) and what it means (the legend) */
export const WHY_TEXT: Record<WhyTerm, { phrase: string; meaning: string }> = {
  colour: { phrase: "close colour", meaning: "the skin is near the colours of your picks" },
  pattern: { phrase: "same pattern", meaning: "the composition follows a pattern you picked" },
  layout: { phrase: "same layout", meaning: "the screen is in a layout family you picked" },
  font: { phrase: "same font", meaning: "the typeface matches one of your picks" },
  radius: { phrase: "similar corners", meaning: "the corner radius is close to your average" },
  recipe: { phrase: "same imagery", meaning: "the picture style is one you picked" },
};

const isWhy = (t: Term): t is WhyTerm => t in WHY_TEXT;

/** "Close colour, same pattern": the first two terms, in the order given, capitalised; "" when there is nothing to say */
export function whyLine(why: readonly Term[]): string {
  const phrases = why.filter(isWhy).slice(0, 2).map((t) => WHY_TEXT[t].phrase);
  if (!phrases.length) return "";
  const line = phrases.join(", ");
  return line[0]!.toUpperCase() + line.slice(1);
}

/** the legend: every term once, in weight order */
export const whyLegend = (): { term: WhyTerm; phrase: string; meaning: string }[] => WHY_TERMS.map((term) => ({ term, ...WHY_TEXT[term] }));
