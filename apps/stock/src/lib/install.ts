// How to install an asset of Stock with the ui8kit CLI: the registry items it is made of (a block variant: its block; a screen page:
// every block of the page, each once, in page order), one `npx ui8kit add` command per runtime and the showcase page of each item on
// the docs site. Plain JSON with English keys (content/install.v0.json), so a service (the MCP server, later) can hand it out as is.
// Pure: the index builder (scripts/lib/build.ts) writes it, the detail page (src/lib/detail.ts) reads it.

/** the runtimes the registry serves, in the order of the runtime facet (`--framework <runtime>` picks the registry root) */
export const RUNTIMES = ["svelte", "react", "vue", "solid", "templ", "twig", "latte", "jinja2"] as const;
export type Runtime = (typeof RUNTIMES)[number];

/** the registry the CLI reads (ui8kit 3.4.0+ default) and the docs site whose /blocks/<name>/ page shows the code of a block */
export const REGISTRY_URL = "https://registry.buildy.tw";
export const DOCS_URL = "https://ui.buildy.tw";

/** one registry item: its name in the registry and its showcase page */
export type InstallItem = { name: string; docs: string };
/** what to install for one asset: the registry, its items, and the command per runtime (all items at once) */
export type Install = { registry: string; items: InstallItem[]; commands: Record<Runtime, string> };
/** content/install.v0.json: `blocks` by registry name, `screens` by asset id (screen.<screen>/<area>) */
export type InstallIndex = { version: string; registry: string; docs: string; runtimes: Runtime[]; blocks: Record<string, Install>; screens: Record<string, Install> };

/** the registry name of an organism (PascalCase -> kebab-case), as packages/kit-compose/src/build.ts names its files */
export const kebab = (s: string): string => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
/** the showcase page of a registry block on the docs site */
export const docsUrl = (name: string): string => `${DOCS_URL}/blocks/${name}/`;
/** the CLI command that adds these items for a runtime */
export const addCommand = (names: readonly string[], rt: Runtime): string => `npx ui8kit add ${names.join(" ")} --framework ${rt}`;

/** the install object of a list of registry items (deduplicated, first occurrence order); none: null */
export function install(names: readonly string[]): Install | null {
  const items = [...new Set(names)];
  if (!items.length) return null;
  return {
    registry: REGISTRY_URL,
    items: items.map((name) => ({ name, docs: docsUrl(name) })),
    commands: Object.fromEntries(RUNTIMES.map((rt) => [rt, addCommand(items, rt)])) as Record<Runtime, string>,
  };
}
