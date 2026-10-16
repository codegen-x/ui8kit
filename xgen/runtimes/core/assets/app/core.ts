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

/**
 * The clock of relative dates. Fixtures are static, so the kit renders them against a fixed instant: every screen,
 * runtime and screenshot shows the same "2 min ago". A live app passes its own `now` to `fromCodex`.
 */
export const DEMO_NOW = "2026-03-30T12:00:00Z";

const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric", timeZone: "UTC" });
/** an RFC 3339 date-time -> "Mar 09, 2026" (UTC); a value that is not a date stays as it is */
export function fmtDate(iso: unknown): unknown {
  const t = typeof iso === "string" ? Date.parse(iso) : NaN;
  return Number.isNaN(t) ? iso : dateFmt.format(t);
}

export type AgoStyle = "ago" | "ago-days" | "ago-short";
/**
 * an RFC 3339 date-time -> time before `now`:
 *   ago        "2 min ago", "1 h ago", "Yesterday", "3 days ago", "2 weeks ago"   (activity feeds)
 *   ago-days   "1 day ago", "5 days ago", "1 week ago", "2 weeks ago"            (postings)
 *   ago-short  "2 min ago", "5 h ago", "3 d ago"                                  (compact cards)
 */
export function fmtAgo(iso: unknown, now: string | number = DEMO_NOW, style: AgoStyle = "ago"): unknown {
  const t = typeof iso === "string" ? Date.parse(iso) : NaN;
  const ref = typeof now === "number" ? now : Date.parse(now);
  if (Number.isNaN(t) || Number.isNaN(ref)) return iso;
  const min = Math.max(0, Math.round((ref - t) / 60000));
  const h = Math.floor(min / 60), d = Math.floor(min / 1440), w = Math.floor(d / 7);
  const pl = (n: number, one: string) => `${n} ${one}${n === 1 ? "" : "s"} ago`;
  if (style === "ago-days") return d < 7 ? pl(Math.max(d, 1), "day") : pl(w, "week");
  if (min < 60) return `${min} min ago`;
  if (h < 24) return `${h} h ago`;
  if (style === "ago-short") return `${d} d ago`;
  if (d === 1) return "Yesterday";
  return d < 7 ? pl(d, "day") : pl(w, "week");
}

export interface ReadOptions { now?: string | number }

/**
 * a value by a dotted path, with an optional formatter after a pipe:
 *   "metadata.date.value|date"  -> fmtDate      "metadata.time.value|ago" (or ago-days, ago-short) -> fmtAgo
 */
export function readPath(source: unknown, path: string, opts: ReadOptions = {}): unknown {
  const [dotted, pipe] = path.split("|") as [string, string | undefined];
  let cur: unknown = source;
  for (const part of dotted.split(".")) {
    if (cur === null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  if (pipe === undefined || cur === undefined) return cur;
  if (pipe === "date") return fmtDate(cur);
  if (pipe === "ago" || pipe === "ago-days" || pipe === "ago-short") return fmtAgo(cur, opts.now ?? DEMO_NOW, pipe);
  throw new Error(`readPath: unknown formatter "${pipe}" in "${path}"`);
}

/** Codex entries -> flat records by the `fields` mapping of the screen ("title", "metadata.price.value", "metadata.date.value|date") */
export function fromCodex<T>(entries: readonly unknown[], fields: Record<string, string>, opts: ReadOptions = {}): T[] {
  return entries.map((e) => Object.fromEntries(Object.entries(fields).map(([name, path]) => [name, readPath(e, path, opts)])) as T);
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
