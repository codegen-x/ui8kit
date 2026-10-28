// The readPath pipes wp-fasty uses (excerpt-fallback, settings:<key>, in-stock, reading-minutes, term-names:<tax>) give what its
// PHP reference (plugins/wpfasty-builder/src/Codex/ReadPath.php) gives on the same inputs; the outputs are recorded in readpath-wpfasty.json
import { expect, test } from "bun:test";
import { EXCERPT_WORDS, WORDS_PER_MINUTE, readPath, wordsOf } from "../assets/app/core";
import vectors from "./readpath-wpfasty.json";

const expand = (s: unknown): unknown => (typeof s === "string" && /^W\d+$/.test(s) ? Array(Number(s.slice(1))).fill("w").join(" ") : s);

test("the wp-fasty pipes equal the PHP reference on its vectors (null there is undefined here)", () => {
  expect(vectors.cases.length).toBeGreaterThanOrEqual(40);
  for (const c of vectors.cases) {
    const source = { ...(c.source as Record<string, unknown>) };
    if ("content" in source) source["content"] = expand(source["content"]);
    const got = readPath(source, c.path, vectors.opts);
    expect([c.label, got === undefined ? null : got]).toEqual([c.label, c.want]);
  }
});

test("the defaults of the PHP reference: 24 excerpt words, 200 words a minute; words strip tags and split on any space", () => {
  expect([EXCERPT_WORDS, WORDS_PER_MINUTE]).toEqual([24, 200]);
  expect(wordsOf("<p>a</p>b\u00a0c")).toEqual(["a", "b", "c"]);
  expect(wordsOf(undefined)).toEqual([]);
});

test("no unknown formatter for these pipes, on present and absent values; another unknown pipe still throws", () => {
  for (const p of ["excerpt-fallback", "settings:x", "in-stock", "reading-minutes", "term-names:category"])
    for (const s of [{}, { v: "a b" }, { v: null }]) expect(() => readPath(s, `v|${p}`)).not.toThrow();
  expect(() => readPath({ v: 1 }, "v|nope")).toThrow("unknown formatter");
});

test("JSON null is absent for every pipe: a null and an absent value read the same, as ReadPath.php (readpath-null.json)", async () => {
  const nulls = (await import("./readpath-null.json")).default as { opts: Record<string, unknown>; cases: Array<{ label: string; source: unknown; path: string; want: unknown }> };
  expect(nulls.cases.length).toBe(38);
  for (const c of nulls.cases) {
    const got = readPath(c.source, c.path, nulls.opts as never);
    expect([c.label, got === undefined ? null : got]).toEqual([c.label, c.want]);
  }
  for (const v of [" ", "\t\n", "\u0000 "]) expect([v, readPath({ v }, "v|html")]).toEqual([v, undefined]);
  expect(readPath({ v: "\u00a0" }, "v|html")).toEqual({ __html: "\u00a0" });
});
