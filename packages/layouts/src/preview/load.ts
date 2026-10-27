// The data of a live preview: the app hands in where things come from (the kit dictionary, the Codex collections, the reader of a
// field map, the screen menus), this assembles the context of one preview. Mapped rows are cached per source (the data is small and
// shared by every card); the rendered DOM is not cached at all, it lives and dies with its card.
import { partsOf, sourcesOf, type Ctx, type DataSource, type Part, type PreviewRef, type Recipes } from "./recipe";

export type Sources = {
  ui: unknown;
  collection: (name: string) => Promise<readonly unknown[]>;
  read: (entries: readonly unknown[], fields: Record<string, string>) => readonly unknown[];
  /** the menu of a composed screen on one of its pages (none: the screen has no menu) */
  nav?: (screen: string, area: string) => Promise<Ctx["nav"]>;
};
export type Shown = { parts: Part[]; ctx: Ctx };
export type Loader = (ref: PreviewRef, prefix: string) => Promise<Shown>;

export function previewLoader(recipes: Recipes, sources: Sources): Loader {
  const rows = new Map<string, Promise<readonly unknown[]>>();
  const rowsOf = (d: DataSource): Promise<readonly unknown[]> => {
    const key = `${d.collection}|${JSON.stringify(d.fields)}`;
    let got = rows.get(key);
    if (!got) {
      got = sources.collection(d.collection).then((e) => sources.read(e, d.fields));
      rows.set(key, got);
    }
    return got;
  };
  return async (ref, prefix) => {
    const parts = partsOf(recipes, ref, prefix);
    const data: Record<string, readonly unknown[]> = {};
    await Promise.all(sourcesOf(recipes, parts).map(async (d) => { data[d.as] = await rowsOf(d); }));
    const ctx: Ctx = { ui: sources.ui, data };
    if (ref.kind === "screen") {
      const name = recipes.screens[ref.screen]?.name;
      const nav = name && sources.nav ? await sources.nav(name, ref.area) : undefined;
      if (nav) ctx.nav = nav;
      ctx.route = { area: ref.area };
    }
    return { parts, ctx };
  };
}
