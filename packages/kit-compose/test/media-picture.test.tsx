// The picture of a section: MediaFrame without an address (or with an empty one) is the decorative placeholder (alt is empty, no lazy hints), with an
// address it shows that picture with its alt text and loads it lazily; the blocks hand `image` / a record's `image` down to it. The same DOM on
// React, Svelte, Vue and Solid.
import { test, expect } from "bun:test";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { blockCases, normalizeHtml } from "../../compose-gen";
import { loadOrganisms } from "../src/organisms";
import { installSsrPlugin } from "./ssr";
import { norm as tokens } from "./shared";

const norm = (html: string) => normalizeHtml(tokens(html)).replace(/ style="([^"]*?);"/g, ' style="$1"');
installSsrPlugin();
const loaded = loadOrganisms();
const gallery = blockCases(loaded.inputs, new Set(loaded.organisms.map((o) => o.name))).cases;
const URL_A = "https://images.example.com/a.jpg";
const URL_B = "https://images.example.com/b.jpg";
const imgs = (html: string) => [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
const attr = (tag: string, name: string) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];

/** every runtime renders the same DOM for the props */
async function renderAll(name: string, file: string, props: Record<string, unknown>): Promise<Record<string, string>> {
  const { render } = await import("svelte/server");
  const { createSSRApp, h } = await import("vue");
  const { renderToString: vueSSR } = await import("@vue/server-renderer");
  const { createComponent } = await import("solid-js");
  const { renderToString: solidSSR } = await import("solid-js/web");
  const R = (await import("../react/src/organisms")) as Record<string, ComponentType<Record<string, unknown>>>;
  const L = (await import("../solid/src/organisms")) as Record<string, unknown>;
  const S = (await import(`../svelte/src/${file}.svelte`)).default;
  const V = (await import(`../vue/src/${file}.vue`)).default;
  const w = console.warn;
  console.warn = () => {};
  try {
    return {
      react: norm(renderToStaticMarkup(createElement(R[name]!, props))),
      svelte: norm(render(S, { props }).body),
      vue: norm(await vueSSR(createSSRApp({ render: () => h(V, props) }))),
      solid: norm(solidSSR(() => createComponent(L[name] as never, props as never)).replace(/ data-hk="[^"]*"/g, "")),
    };
  } finally { console.warn = w; }
}
const same = (out: Record<string, string>) => { for (const rt of ["svelte", "vue", "solid"]) expect(out[rt], rt).toBe(out.react!); };

test("MediaFrame: no address or an empty one is the decorative placeholder", async () => {
  for (const props of [{ alt: "Cake" }, { alt: "Cake", src: "" }]) {
    const out = await renderAll("MediaFrame", "components/media-frame", props);
    same(out);
    const tags = imgs(out.react!);
    expect(tags.length).toBe(2);
    for (const t of tags) {
      expect(attr(t, "alt"), t).toBe("");
      expect(attr(t, "src")!.startsWith("data:image/svg+xml;base64,"), t).toBe(true);
      expect(attr(t, "loading"), t).toBeUndefined();
    }
    expect(out.react).toContain('data-placeholder="true"');
  }
});

test("MediaFrame: an address is the picture, with its alt text, lazy and async", async () => {
  const out = await renderAll("MediaFrame", "components/media-frame", { alt: "Cake", src: URL_A });
  same(out);
  const tags = imgs(out.react!);
  expect(tags.length).toBe(2);
  for (const t of tags) {
    expect(attr(t, "src"), t).toBe(URL_A);
    expect(attr(t, "alt"), t).toBe("Cake");
    expect(attr(t, "loading"), t).toBe("lazy");
    expect(attr(t, "decoding"), t).toBe("async");
  }
  expect(out.react).toContain('data-placeholder="false"');
  const dark = await renderAll("MediaFrame", "components/media-frame", { alt: "Cake", src: URL_A, darkSrc: URL_B });
  same(dark);
  expect(imgs(dark.react!).map((t) => attr(t, "src"))).toEqual([URL_A, URL_B]);
});

/** the gallery case of a block with `extra` props over it */
async function blockWith(block: string, organism: string, file: string, extra: (props: Record<string, any>) => Record<string, unknown>) {
  const c = gallery.find((x) => x.organism === organism && x.label.startsWith(`${block}.`)) ?? gallery.find((x) => x.organism === organism)!;
  const props = { ...(c.props as Record<string, unknown>), ...extra(c.props as Record<string, any>) };
  return { props, out: await renderAll(organism, file, props) };
}

test("HeroSplit: image and imageAlt reach the picture; without them the title is not announced", async () => {
  const withImage = await blockWith("hero-split", "HeroSplit", "blocks/hero-split", (p) => ({ image: URL_A, imageAlt: "A cake", media: "picture", title: p.title }));
  same(withImage.out);
  expect(imgs(withImage.out.react!).filter((t) => attr(t, "src") === URL_A).map((t) => attr(t, "alt"))).toEqual(["A cake", "A cake"]);
  const noAlt = await blockWith("hero-split", "HeroSplit", "blocks/hero-split", (p) => ({ image: URL_A, media: "picture", title: p.title }));
  same(noAlt.out);
  expect(imgs(noAlt.out.react!).filter((t) => attr(t, "src") === URL_A).map((t) => attr(t, "alt"))).toEqual([noAlt.props.title, noAlt.props.title]);
  const none = await blockWith("hero-split", "HeroSplit", "blocks/hero-split", () => ({ media: "picture" }));
  expect(imgs(none.out.react!).some((t) => attr(t, "src") === URL_A)).toBe(false);
  expect(imgs(none.out.react!).every((t) => attr(t, "alt") === "")).toBe(true);
});

test("PhotoGallery: the image of a photo is its picture", async () => {
  const { props, out } = await blockWith("photo-gallery", "PhotoGallery", "blocks/photo-gallery", (p) => ({ layout: "grid", photos: (p.photos as Record<string, unknown>[]).map((x, i) => (i === 0 ? { ...x, image: URL_A } : x)) }));
  same(out);
  const first = imgs(out.react!).filter((t) => attr(t, "src") === URL_A);
  expect(first.length).toBe(2);
  expect(attr(first[0]!, "alt")).toBe((props.photos as { title: string }[])[0]!.title);
  expect(imgs(out.react!).filter((t) => attr(t, "src")!.startsWith("data:")).every((t) => attr(t, "alt") === "")).toBe(true);
});
