// Text and number formatting shared by every generated organism and screen. Pure functions, no runtime dependency.

/** fills {0}, {1}... of a content template */
export function tpl(template: string | undefined, ...values: Array<string | number | undefined>): string {
  return (template ?? "").replace(/\{(\d+)\}/g, (_m, i: string) => String(values[Number(i)] ?? ""));
}

const nf = new Intl.NumberFormat("en-US");
export function fmtNumber(n: number): string {
  return nf.format(n);
}

const moneyCache = new Map<string, Intl.NumberFormat>();
export function fmtMoney(amount: number, currency: string): string {
  let f = moneyCache.get(currency);
  if (!f) {
    f = new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 });
    moneyCache.set(currency, f);
  }
  return f.format(amount);
}

/** a content word by key (the status of a record -> its label); the key itself when the dictionary has no entry */
export function at(dict: Record<string, string> | undefined, key: string): string {
  return dict?.[key] ?? key;
}

/** the page numbers a pager shows: the first, the last and the neighbours of the current page; null is a gap */
export function pageWindow(page: number, pages: number): (number | null)[] {
  const keep = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages));
  const out: (number | null)[] = [];
  let prev = 0;
  for (const n of [...keep].sort((a, b) => a - b)) {
    if (n - prev > 1) out.push(null);
    out.push(n);
    prev = n;
  }
  return out;
}

/** a responsive column variant of Grid capped by the number of items, so no column stays empty: ("1-4", 3) -> "1-3", ("2-6", 4) -> "2-4" */
export function fitCols(cols: string, n: number): string {
  const m = /^(\d+)-(\d+)$/.exec(cols);
  if (!m) return cols;
  const lo = Number(m[1]), hi = Number(m[2]);
  if (n >= hi) return cols;
  const top = Math.max(lo, n);
  const known = ["1-2", "1-3", "1-4", "2-3", "2-4", "2-6", "3-6"];
  for (let h = top; h > lo; h--) if (known.includes(`${lo}-${h}`)) return `${lo}-${h}`;
  return String(Math.min(lo, Math.max(n, 1)));
}

/** a label of segments joined by ", " without a segment equal (case-insensitive) to the one before it:
 *  "Footer, Footer, Centered" -> "Footer, Centered" */
export function uniqLabel(label: string | undefined): string {
  const parts = (label ?? "").split(", ");
  return parts.filter((s, i) => i === 0 || s.toLowerCase() !== (parts[i - 1] ?? "").toLowerCase()).join(", ");
}
