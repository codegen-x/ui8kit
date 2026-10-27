// The routes of Stock (hash routing, so the same build works under any base: `/` on Vercel, `/stock/` elsewhere):
//   #/search?q=…&job=…&page=2  the storefront (also every other hash, and none)
//   #/asset/<asset id>         the detail page of a block variant or a screen page (ids: block.about/split, screen.site/home)
//   #/frame/<asset id>         the bare live render of an asset, the document of the detail page's device frame (an iframe)
export type Route = { kind: "search"; query: string } | { kind: "asset"; id: string } | { kind: "frame"; id: string };

const ID = /^[a-z0-9][a-zA-Z0-9./-]*$/;

export function parseRoute(hash: string): Route {
  const h = hash.replace(/^#/, "");
  for (const kind of ["asset", "frame"] as const) {
    const pre = `/${kind}/`;
    if (h.startsWith(pre)) {
      const id = decodeURIComponent(h.slice(pre.length).split("?")[0]!);
      if (ID.test(id)) return { kind, id };
    }
  }
  return { kind: "search", query: h.startsWith("/search") ? h.replace(/^\/search\??/, "") : "" };
}

export const assetHash = (id: string): string => "#/asset/" + id;
export const frameHash = (id: string): string => "#/frame/" + id;
