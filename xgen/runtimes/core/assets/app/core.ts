// The portable runtime of a generated app: pure TypeScript, shared by the Svelte and the React runtime.
// It holds everything a screen does that is not markup: the Codex mapping, search/sort/page, routes and the URL as a port.

export type SortDir = "asc" | "desc";
export interface ListConfig { searchFields: readonly string[]; pageSize: number; defaultSort: string }
export interface ListState { q?: string; sort?: string; page?: string }
export interface ListView<T> {
  rows: T[];
  total: number;
  page: number;
  pages: number;
  sort: { field: string; dir: SortDir };
  q: string;
  /** 1-based position of the first and the last row on the page (0 when empty) */
  from: number;
  to: number;
  /** the query string of the current list state ("?sort=price:desc&page=2" or ""), appended to links so a record keeps the list state */
  qs: string;
}

export function readPath(source: unknown, path: string): unknown {
  let cur: unknown = source;
  for (const part of path.split(".")) {
    if (cur === null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

/** Codex entries -> flat records by the `fields` mapping of the screen ("title.en", "metadata.price.value") */
export function fromCodex<T>(entries: readonly unknown[], fields: Record<string, string>): T[] {
  return entries.map((e) => Object.fromEntries(Object.entries(fields).map(([name, path]) => [name, readPath(e, path)])) as T);
}

export function parseSort(sort: string | undefined, fallback: string): { field: string; dir: SortDir } {
  const [field, dir] = (sort || fallback).split(":");
  return { field: field || fallback.split(":")[0]!, dir: dir === "desc" ? "desc" : "asc" };
}

const compare = (a: unknown, b: unknown): number => {
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
  return String(a ?? "").localeCompare(String(b ?? ""), "en", { numeric: true, sensitivity: "base" });
};

export function listQuery(state: { q: string; sort: string; page: number }, cfg: ListConfig): string {
  const p = new URLSearchParams();
  if (state.q) p.set("q", state.q);
  if (state.sort && state.sort !== cfg.defaultSort) p.set("sort", state.sort);
  if (state.page > 1) p.set("page", String(state.page));
  const s = p.toString().replace(/%3A/gi, ":");
  return s ? `?${s}` : "";
}

export function collectionView<T extends object>(all: readonly T[], cfg: ListConfig, state: ListState): ListView<T> {
  const q = (state.q ?? "").trim();
  const sort = parseSort(state.sort, cfg.defaultSort);
  const needle = q.toLowerCase();
  const found = needle ? all.filter((r) => cfg.searchFields.some((f) => String((r as Record<string, unknown>)[f] ?? "").toLowerCase().includes(needle))) : [...all];
  const sign = sort.dir === "desc" ? -1 : 1;
  found.sort((a, b) => sign * compare((a as Record<string, unknown>)[sort.field], (b as Record<string, unknown>)[sort.field]));
  const total = found.length;
  const pages = Math.max(1, Math.ceil(total / cfg.pageSize));
  const page = Math.min(Math.max(1, Math.floor(Number(state.page)) || 1), pages);
  const start = (page - 1) * cfg.pageSize;
  const rows = found.slice(start, start + cfg.pageSize);
  return {
    rows, total, page, pages, sort, q,
    from: total ? start + 1 : 0,
    to: start + rows.length,
    qs: listQuery({ q, sort: `${sort.field}:${sort.dir}`, page }, cfg),
  };
}

// ---- routes -----------------------------------------------------------------------------------------------

export interface RouteDef { path: string; area: string }
export interface RouteMatch { area: string; params: Record<string, string> }

export function matchRoute(routes: readonly RouteDef[], path: string): RouteMatch | null {
  const parts = path.split("/").filter(Boolean);
  for (const r of routes) {
    const pat = r.path.split("/").filter(Boolean);
    if (pat.length !== parts.length) continue;
    const params: Record<string, string> = {};
    if (pat.every((seg, i) => (seg.startsWith(":") ? ((params[seg.slice(1)] = decodeURIComponent(parts[i]!)), true) : seg === parts[i]))) return { area: r.area, params };
  }
  return null;
}

/** does a route of this list own the path (decides which screen of an app shows) */
export const ownsPath = (routes: readonly RouteDef[], path: string): boolean => matchRoute(routes, path) !== null;

// ---- the URL as a port --------------------------------------------------------------------------------------
// A screen never touches window.location. It gets a UrlPort: Svelte wraps the store in runes, React in useSyncExternalStore.

export interface UrlState { path: string; query: Record<string, string> }
export interface UrlPort extends UrlState { go(path: string, query?: Record<string, string | undefined>): void }

/** `#/pricing` and the empty hash are routes; `#main-content` is an in-page anchor (the skip link) and leaves the route alone */
export const isRouteHash = (hash: string): boolean => hash === "" || hash === "#" || hash.startsWith("#/");

export function parseHash(hash: string): UrlState {
  const raw = hash.replace(/^#\/?/, "");
  const [path = "", search = ""] = raw.split("?");
  const query: Record<string, string> = {};
  for (const [k, v] of new URLSearchParams(search)) query[k] = v;
  return { path: path.replace(/\/+$/, ""), query };
}

export function buildHash(path: string, query: Record<string, string | undefined> = {}): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== "") p.set(k, v);
  const s = p.toString().replace(/%3A/gi, ":");
  return `#/${path}${s ? `?${s}` : ""}`;
}

export interface HashStore { getSnapshot(): UrlState; subscribe(fn: () => void): () => void; go: UrlPort["go"] }

/** the URL state in location.hash; the snapshot object changes only when the hash changes (useSyncExternalStore needs that) */
export function createHashStore(win: Window = window): HashStore {
  let hash = win.location.hash;
  let snap = parseHash(isRouteHash(hash) ? hash : "");
  const subs = new Set<() => void>();
  const read = (): void => {
    if (win.location.hash === hash) return;
    hash = win.location.hash;
    if (!isRouteHash(hash)) return;
    snap = parseHash(hash);
    subs.forEach((f) => f());
  };
  win.addEventListener("hashchange", read);
  return {
    getSnapshot: () => snap,
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
    go(path, query) { win.location.hash = buildHash(path, query); read(); },
  };
}

// ---- screen actions ---------------------------------------------------------------------------------------

export interface ScreenActions {
  sort(field: string): void;
  search(q: string): void;
  page(n: number): void;
  open(id: string): void;
  back(): void;
  toggleTheme(): void;
}

/** the actions of a collection screen; every one of them only changes the URL */
export function screenActions(url: UrlPort, view: ListView<object>, listPath: string, recordPath: (id: string) => string, toggleTheme: () => void): ScreenActions {
  const q = (extra: Record<string, string | undefined>): Record<string, string | undefined> => ({ ...url.query, ...extra });
  return {
    sort(field) {
      const dir: SortDir = view.sort.field === field && view.sort.dir === "asc" ? "desc" : "asc";
      url.go(listPath, q({ sort: `${field}:${dir}`, page: undefined }));
    },
    search(text) { url.go(listPath, q({ q: text || undefined, page: undefined })); },
    page(n) { url.go(listPath, q({ page: n > 1 ? String(n) : undefined })); },
    open(id) { url.go(recordPath(id), url.query); },
    back() { url.go(listPath, url.query); },
    toggleTheme,
  };
}
