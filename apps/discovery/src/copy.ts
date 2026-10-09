// The copy decks of the taste screens: neutral placeholder English, no brands, kept in content/copy.json (rule 06: text lives
// in fixtures). A screen gets one deck as its `c` prop and picks what its composition needs.
import decks from "../content/copy.json";

export type Stat = { value: string; label: string };
export type Item = { title: string; text: string };

export type Deck = {
  /** a generic one-word wordmark, never a real brand */
  brand: string;
  nav: string[];
  eyebrow: string;
  title: string;
  /** a second line or an emphasised fragment of the title */
  accent: string;
  lead: string;
  cta: string;
  secondary: string;
  /** placeholder of an input */
  input: string;
  /** small print under an action */
  note: string;
  stats: Stat[];
  items: Item[];
  tags: string[];
  /** optional extras of the fintech deck: price plans, testimonials, questions */
  plans?: { name: string; price: string; note: string; perks: string[] }[];
  quotes?: { text: string; name: string; role: string }[];
  faq?: Item[];
};

export const DECKS: Deck[] = decks as Deck[];
export const deckAt = (i: number): Deck => DECKS[((i % DECKS.length) + DECKS.length) % DECKS.length]!;
