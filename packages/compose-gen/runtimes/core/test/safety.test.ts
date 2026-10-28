// The output safety of the organism runtime (assets/ts/safe.ts) against the shared vectors (safety-vectors.json), which the PHP,
// Python and Go ports are held to as well (packages/kit-compose/test/safety-ports.test.ts)
import { expect, test } from "bun:test";
import { attrValueOf, cssValue, decodeEntities, isSafeAttrName, isSafeUrl, srcsetOf, styleOf, urlOf } from "../assets/ts/safe";
import v from "./safety-vectors.json";

test("URLs: an allowlist (paths, #, ?, http(s), mailto, tel; data:image/* only for images), seen through entities, whitespace and case; //host refused", () => {
  for (const [value, image, ok] of v.url as Array<[string, boolean, boolean]>) {
    expect([value, image, isSafeUrl(value, image)]).toEqual([value, image, ok]);
    expect(urlOf(value, image)).toBe(ok ? value : "");
  }
  expect([urlOf(undefined), urlOf(null), urlOf({ __html: "x" }), urlOf(7)]).toEqual([undefined, null, "", "7"]);
});
test("srcset candidate by candidate, style url(...) and script forms, attribute names", () => {
  for (const [value, ok] of v.srcset as Array<[string, boolean]>) expect([value, srcsetOf(value)]).toEqual([value, ok ? value : ""]);
  for (const [value, ok] of v.style as Array<[string, boolean]>) expect([value, styleOf(value)]).toEqual([value, ok ? value : ""]);
  for (const [name, ok] of v.names as Array<[string, boolean]>) expect([name, isSafeAttrName(name)]).toEqual([name, ok]);
  for (const [value, ok] of v.css as Array<[string, boolean]>) expect([value, cssValue(value)]).toEqual([value, ok ? value : ""]);
  for (const [name, value, want] of v.attrs as Array<[string, string, string]>) expect([name, value, attrValueOf(name, value)]).toEqual([name, value, want]);
});
test("entities as a browser decodes them in an attribute: numeric with or without ;, the named ones that spell URL syntax", () => {
  expect(decodeEntities("&#106;&#x61;&colon;&Tab;&NewLine;&sol;&bsol;&amp;#58;&nope;&#0;")).toBe("ja:\t\n/\\:&nope;\ufffd");
});
test("no TrustedHtml marker in a sample or fixture: trusted markup comes only from a read pipe (|html) or an adapter", async () => {
  const { readdirSync, readFileSync, statSync } = await import("node:fs");
  const { join, resolve } = await import("node:path");
  const root = resolve(import.meta.dir, "../../..");
  const files = (dir: string): string[] => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? files(join(dir, f)) : [join(dir, f)]));
  const hits = ["specs", "fixtures", "screens/src/authoring"].flatMap((d) => files(join(root, d))).filter((f) => readFileSync(f, "utf8").includes("__html"));
  expect(hits).toEqual([]);
});
