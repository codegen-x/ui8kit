// The sources of the live previews: the kit dictionary and the Codex collections of @ui8kit/app-shared (loaded on demand), the
// screen menus (nav/<ScreenName>), the recipes of content/previews.v0.json.
import { previewLoader } from "@ui8kit/layouts/preview/load";
import type { Recipes } from "@ui8kit/layouts/preview/recipe";
import { ui } from "@ui8kit/app-shared/content";
import { CODEX } from "@ui8kit/app-shared/runtime/codex";
import { fromCodex } from "@ui8kit/app-shared/runtime/core";
import recipes from "../../content/previews.v0.json";
import { COLLECTIONS } from "./collections.gen";

const NAVS = import.meta.glob<{ navOf: (area: string) => { links: readonly unknown[]; current: string } }>("../../../../packages/shared/app/src/nav/*.ts");

export const loadPreview = previewLoader(recipes as unknown as Recipes, {
  ui,
  collection: (name) => COLLECTIONS[name]?.() ?? Promise.resolve([]),
  read: (entries, fields) => fromCodex(entries, fields, CODEX),
  nav: async (screen, area) => {
    const load = NAVS[`../../../../packages/shared/app/src/nav/${screen}.ts`];
    return load ? (await load()).navOf(area) : undefined;
  },
});
