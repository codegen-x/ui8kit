// The routes of Stock (hash routing, so the same build works under any base: `/` on Vercel, `/stock/` elsewhere):
//   #/search?q=…&job=…&page=2  the storefront (also every other hash, and none)
//   #/asset/<asset id>         the detail page of a block variant or a screen page (ids: block.about/split, screen.site/home)
//   #/asset/<id>?view=full&device=phone   the same page with its full-screen preview open, at a device width (desktop by default)
//   #/frame/<asset id>         the bare live render of an asset, the document of the detail page's device frame (an iframe)
export type Route = { kind: "search"; query: string } | { kind: "asset"; id: string; full?: Full } | { kind: "frame"; id: string };
/** the full-screen preview of a detail page and its device */
export type Full = { device: Device };
export type Device = "desktop" | "tablet" | "phone";
const DEVICE_IDS: readonly string[] = ["desktop", "tablet", "phone"];

const ID = /^[a-z0-9][a-zA-Z0-9./-]*$/;

export function parseRoute(hash: string): Route {
  const h = hash.replace(/^#/, "");
  for (const kind of ["asset", "frame"] as const) {
    const pre = `/${kind}/`;
    if (h.startsWith(pre)) {
      const [path, query = ""] = h.slice(pre.length).split("?") as [string, string?];
      const id = decodeURIComponent(path);
      if (!ID.test(id)) continue;
      const p = new URLSearchParams(query);
      if (kind === "asset" && p.get("view") === "full") {
        const d = p.get("device") ?? "";
        return { kind, id, full: { device: (DEVICE_IDS.includes(d) ? d : "desktop") as Device } };
      }
      return { kind, id };
    }
  }
  return { kind: "search", query: h.startsWith("/search") ? h.replace(/^\/search\??/, "") : "" };
}

export const assetHash = (id: string, full?: Full): string =>
  "#/asset/" + id + (full ? "?view=full" + (full.device === "desktop" ? "" : "&device=" + full.device) : "");
export const frameHash = (id: string): string => "#/frame/" + id;
