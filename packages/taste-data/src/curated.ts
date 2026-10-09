// The rows the user has curated in the panorama, one row at a time (the Discovery inbox: picks sent with their row).
// For each row, `keep` are the taste screens picked on it: every card of that row showing one of them stays as it is;
// the other cards of that row are refilled with variations of the kept screens (engine/curate.ts). Rows not listed here,
// and the whole rest of the wall, stay exactly as engine/assign.ts lays them out. Applied in order.
export type CuratedRow = {
  /** counted from the top: 1 is latitude +60°, 21 is −60° */
  row: number;
  /** the picked taste screen ids of that row */
  keep: string[];
  /** 2 = laid after the first exclusion (inbox #3) so the cards of the earlier layers stay as they were; see engine/wall.ts */
  layer?: 2;
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
  // inbox #4 (2026-10-09 14:18 MSK): exclude on rows 5, 6, 8, 11, 12, 13, 15; kept = the other screens now on each row (layer 2)
  {
    row: 5,
    layer: 2,
    keep: [
      "t046-stats-duotone", "t036-ribbon-dots", "t003-fullbleed-grain", "t099-frame-geometric", "t058-editorial-dots",
      "t023-fullbleed-mesh", "t117-frame-conic", "t050-prompt-dots", "t048-editorial-rings", "t116-editorial-grain",
      "t040-dense-mesh", "t039-prompt-glass", "t115-editorial-duotone", "t060-prompt-flat", "t076-stats-conic",
      "t065-airy-duotone", "t072-split-geometric", "t078-editorial-conic", "t013-frame-glass", "t014-editorial-grain",
      "t017-ribbon-flat", "t055-airy-conic", "t028-frame-dots", "t108-dense-conic", "t118-frame-mesh",
      "t006-ribbon-rings", "t051-poster-stripes", "t044-dense-conic", "t090-prompt-duotone", "t063-fullbleed-conic",
      "t052-split-rings", "t070-prompt-geometric",
    ],
  },
  {
    row: 6,
    layer: 2,
    keep: [
      "t082-split-flat", "t048-editorial-rings", "t076-stats-conic", "t064-dense-rings", "t011-split-stripes",
      "t091-poster-glass", "t005-stats-flat", "t062-split-duotone", "t034-airy-stripes", "t081-poster-conic",
      "t059-frame-rings", "t107-dense-geometric", "t025-stats-mesh", "t047-ribbon-conic", "t054-dense-glass",
      "t020-fullbleed-stripes", "t102-poster-grain", "t038-frame-flat", "t093-fullbleed-dots", "t085-airy-grain",
      "t114-ribbon-flat", "t053-fullbleed-geometric", "t016-stats-rings", "t103-split-glass", "t104-split-dots",
      "t088-editorial-stripes", "t056-stats-grain", "t010-dense-geometric", "t002-split-glass", "t086-stats-stripes",
      "t007-editorial-duotone", "t119-prompt-geometric", "t042-split-grain", "t045-airy-glass", "t113-ribbon-rings",
      "t066-stats-glass", "t067-ribbon-stripes", "t027-editorial-flat", "t083-fullbleed-glass",
    ],
  },
  {
    row: 8,
    layer: 2,
    keep: [
      "t112-stats-glass", "t037-editorial-mesh", "t074-dense-grain", "t031-split-conic", "t038-frame-flat",
      "t039-prompt-glass", "t047-ribbon-conic", "t048-editorial-rings", "t103-split-glass", "t111-stats-flat",
      "t011-split-stripes", "t084-dense-dots", "t017-ribbon-flat", "t056-stats-grain", "t034-airy-stripes",
      "t105-fullbleed-duotone", "t066-stats-glass", "t088-editorial-stripes", "t003-fullbleed-grain", "t035-stats-geometric",
      "t082-split-flat", "t054-dense-glass", "t120-prompt-stripes", "t093-fullbleed-dots", "t072-split-geometric",
      "t090-prompt-duotone", "t108-dense-conic", "t091-poster-glass", "t100-prompt-stripes", "t065-airy-duotone",
      "t002-split-glass", "t096-stats-dots", "t079-frame-stripes", "t046-stats-duotone", "t013-frame-glass",
      "t051-poster-stripes", "t052-split-rings",
    ],
  },
  {
    row: 11,
    layer: 2,
    keep: [
      "t082-split-flat", "t028-frame-dots", "t033-fullbleed-rings", "t060-prompt-flat", "t008-frame-conic",
      "t098-editorial-geometric", "t096-stats-dots", "t075-airy-rings", "t079-frame-stripes", "t094-dense-flat",
      "t037-editorial-mesh", "t043-fullbleed-duotone", "t114-ribbon-flat", "t014-editorial-grain", "t107-dense-geometric",
      "t102-poster-grain", "t052-split-rings", "t090-prompt-duotone", "t020-fullbleed-stripes", "t076-stats-conic",
      "t010-dense-geometric", "t113-ribbon-rings", "t021-split-dots", "t085-airy-grain", "t017-ribbon-flat",
      "t115-editorial-duotone", "t092-split-mesh", "t038-frame-flat", "t007-editorial-duotone", "t001-poster-mesh",
      "t072-split-geometric", "t074-dense-grain", "t089-frame-mesh", "t105-fullbleed-duotone", "t070-prompt-geometric",
      "t004-airy-dots", "t116-editorial-grain", "t081-poster-conic", "t065-airy-duotone", "t099-frame-geometric",
      "t080-prompt-rings", "t088-editorial-stripes",
    ],
  },
  {
    row: 12,
    layer: 2,
    keep: [
      "t035-stats-geometric", "t091-poster-glass", "t055-airy-conic", "t036-ribbon-dots", "t025-stats-mesh",
      "t054-dense-glass", "t034-airy-stripes", "t031-split-conic", "t053-fullbleed-geometric", "t050-prompt-dots",
      "t056-stats-grain", "t087-ribbon-geometric", "t109-airy-rings", "t104-split-dots", "t046-stats-duotone",
      "t013-frame-glass", "t111-stats-flat", "t084-dense-dots", "t103-split-glass", "t118-frame-mesh",
      "t027-editorial-flat", "t083-fullbleed-glass", "t069-frame-duotone", "t063-fullbleed-conic", "t016-stats-rings",
      "t024-airy-geometric", "t100-prompt-stripes", "t044-dense-conic", "t045-airy-glass", "t093-fullbleed-dots",
      "t086-stats-stripes", "t095-airy-flat", "t041-poster-rings", "t108-dense-conic", "t006-ribbon-rings",
      "t019-dense-duotone", "t038-frame-flat", "t120-prompt-stripes", "t048-editorial-rings", "t057-ribbon-duotone",
      "t076-stats-conic", "t015-airy-mesh",
    ],
  },
  {
    row: 13,
    layer: 2,
    keep: [
      "t029-prompt-grain", "t064-dense-rings", "t011-split-stripes", "t022-poster-geometric", "t080-prompt-rings",
      "t014-editorial-grain", "t001-poster-mesh", "t109-airy-rings", "t002-split-glass", "t090-prompt-duotone",
      "t066-stats-glass", "t078-editorial-conic", "t033-fullbleed-rings", "t084-dense-dots", "t098-editorial-geometric",
      "t100-prompt-stripes", "t105-fullbleed-duotone", "t024-airy-geometric", "t051-poster-stripes", "t096-stats-dots",
      "t075-airy-rings", "t072-split-geometric", "t036-ribbon-dots", "t034-airy-stripes", "t062-split-duotone",
      "t013-frame-glass", "t003-fullbleed-grain", "t114-ribbon-flat", "t035-stats-geometric", "t118-frame-mesh",
      "t052-split-rings", "t087-ribbon-geometric", "t058-editorial-dots", "t023-fullbleed-mesh", "t110-airy-dots",
      "t068-editorial-glass", "t046-stats-duotone", "t008-frame-conic", "t093-fullbleed-dots", "t074-dense-grain",
      "t079-frame-stripes",
    ],
  },
  {
    row: 15,
    layer: 2,
    keep: [
      "t083-fullbleed-glass", "t119-prompt-geometric", "t104-split-dots", "t045-airy-glass", "t102-poster-grain",
      "t057-ribbon-duotone", "t016-stats-rings", "t041-poster-rings", "t027-editorial-flat", "t042-split-grain",
      "t020-fullbleed-stripes", "t111-stats-flat", "t116-editorial-grain", "t040-dense-mesh", "t004-airy-dots",
      "t003-fullbleed-grain", "t034-airy-stripes", "t010-dense-geometric", "t089-frame-mesh", "t006-ribbon-rings",
      "t117-frame-conic", "t095-airy-flat", "t056-stats-grain", "t099-frame-geometric", "t092-split-mesh",
      "t067-ribbon-stripes", "t085-airy-grain", "t015-airy-mesh", "t054-dense-glass", "t025-stats-mesh",
      "t024-airy-geometric",
    ],
  },
];

/** Screens the user excluded (inbox #3, 2026-10-09): no card of the wall shows them, on any row. After the curated rows,
 *  every card with one of these is refilled with a variation of the other screens of its row (engine/wall.ts). Unlike
 *  CURATED_ROWS this puts no dot on a row. */
export const EXCLUDED_SCREENS: string[] = ["t009-prompt-mesh", "t077-ribbon-grain"];

/** Screens the user excluded in inbox #4 (2026-10-09, layer 2): removed from the whole wall like EXCLUDED_SCREENS, laid on top of it
 *  so no other card moves. The rows the user marked are in CURATED_ROWS (layer 2); other rows holding one of these are refilled the same way. */
export const EXCLUDED_SCREENS_2: string[] = [
  "t049-frame-grain", "t030-dense-stripes", "t032-poster-duotone", "t026-ribbon-glass", "t106-fullbleed-stripes",
  "t097-ribbon-mesh", "t061-poster-grain", "t101-poster-mesh", "t073-fullbleed-flat",
];
