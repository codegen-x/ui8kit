// The rows the user has curated in the panorama, one row at a time (the Discovery inbox: picks sent with their row).
// For each row, `keep` are the taste screens picked on it: every card of that row showing one of them stays as it is;
// the other cards of that row are refilled with variations of the kept screens (engine/curate.ts). Rows not listed here,
// and the whole rest of the wall, stay exactly as engine/assign.ts lays them out. Applied in order.
export type CuratedRow = {
  /** counted from the top: 1 is latitude +60°, 21 is −60° */
  row: number;
  /** the picked taste screen ids of that row */
  keep: string[];
};

export const CURATED_ROWS: CuratedRow[] = [
  // inbox #1 (2026-10-09 00:36 MSK): 14 picks on the top row
  {
    row: 1,
    keep: [
      "t036-ribbon-dots", "t031-split-conic", "t059-frame-rings", "t105-fullbleed-duotone", "t018-prompt-conic",
      "t007-editorial-duotone", "t073-fullbleed-flat", "t019-dense-duotone", "t021-split-dots", "t050-prompt-dots",
      "t002-split-glass", "t028-frame-dots", "t017-ribbon-flat", "t092-split-mesh",
    ],
  },
  // inbox #2 (2026-10-09 00:54 MSK): 21 picks on row 2 (+54°)
  {
    row: 2,
    keep: [
      "t016-stats-rings", "t012-poster-flat", "t096-stats-dots", "t011-split-stripes", "t071-poster-dots",
      "t070-prompt-geometric", "t052-split-rings", "t001-poster-mesh", "t112-stats-glass", "t040-dense-mesh",
      "t051-poster-stripes", "t063-fullbleed-conic", "t094-dense-flat", "t067-ribbon-stripes", "t080-prompt-rings",
      "t020-fullbleed-stripes", "t061-poster-grain", "t068-editorial-glass", "t062-split-duotone", "t077-ribbon-grain",
      "t055-airy-conic",
    ],
  },
  // inbox #3 (2026-10-09 10:22 MSK): exclude on row 19 (-48°, 32 cards): t009-prompt-mesh and t077-ribbon-grain removed; kept = the other screens now on the row
  {
    row: 19,
    keep: [
      "t056-stats-grain", "t081-poster-conic", "t068-editorial-glass", "t114-ribbon-flat", "t102-poster-grain",
      "t096-stats-dots", "t055-airy-conic", "t087-ribbon-geometric", "t023-fullbleed-mesh", "t019-dense-duotone",
      "t059-frame-rings", "t085-airy-grain", "t002-split-glass", "t012-poster-flat", "t117-frame-conic",
      "t014-editorial-grain", "t113-ribbon-rings", "t051-poster-stripes", "t010-dense-geometric", "t061-poster-grain",
      "t015-airy-mesh", "t103-split-glass", "t044-dense-conic", "t024-airy-geometric", "t089-frame-mesh",
      "t018-prompt-conic", "t027-editorial-flat", "t026-ribbon-glass", "t120-prompt-stripes", "t037-editorial-mesh",
    ],
  },
];

/** Screens the user excluded (inbox #3, 2026-10-09): no card of the wall shows them, on any row. After the curated rows,
 *  every card with one of these is refilled with a variation of the other screens of its row (engine/wall.ts). Unlike
 *  CURATED_ROWS this puts no dot on a row. */
export const EXCLUDED_SCREENS: string[] = ["t009-prompt-mesh", "t077-ribbon-grain"];
