// The catalog of INCLUDED styles: designs (screen + skin + font pairing + radius, the card's full style) that must be in the
// future marketplace showcase. Written by `bun run included` (scripts/included.ts) from the Discovery inbox journal
// (`?cards=include` posts); deduped by full style. Plan: plan/included-styles.md is generated from this file.
import data from "./included.json";

export type IncludedStyle = {
  /** `${id}|${skin}|${display}+${body}|${radius}`, same as variantKey() in taste.ts */
  key: string;
  /** taste screen id, e.g. "t001-poster-mesh" */
  id: string;
  skin: string;
  fonts: { display: string; body: string };
  radius: number;
  /** ISO time of the first journal entry that included this style */
  firstSeen: string;
  /** every card it was outlined on: row counted from the top (1 = +60°), column in the row, journal time */
  sightings: { time: string; row: number; col: number }[];
};

export const INCLUDED: IncludedStyle[] = data as IncludedStyle[];
