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
];
