// The wall the panorama shows: assign.ts over every card, then the curated rows (curated.ts) refilled by curate.ts.
import { CURATED_ROWS } from "../curated";
import type { Taste, Variant } from "../taste";
import { assign } from "./assign";
import { curate } from "./curate";
import type { Card } from "./grid";

export const wall = (cards: Card[], tastes: Taste[]): Variant[] => curate(cards, assign(cards, tastes), tastes, CURATED_ROWS);
