// The URL sinks of the generated views, the same in every runtime: a primitive prop or free attribute whose name is a URL
// attribute (Href, Src, SrcSet, Action, ...; href, src, ...) is printed through the runtime's URL check (assets/ts/safe.ts and its
// PHP, Python and Go ports). A literal is checked here, at generation: an unsafe literal is an error in the spec.
import { IMAGE_ATTRS, isSafeAttrName, isSafeUrl, srcsetUrls, URL_ATTRS } from "../assets/ts/safe";

export type Sink = { kind: "url"; image: boolean } | { kind: "srcset" };

/** the sink of a prop or attribute name (PascalCase prop names read as the attribute: SrcSet is srcset), or undefined */
export function sinkOf(name: string): Sink | undefined {
  const n = name.toLowerCase();
  if (n === "srcset" || n === "imagesrcset") return { kind: "srcset" };
  if (URL_ATTRS.includes(n)) return { kind: "url", image: IMAGE_ATTRS.includes(n) };
  return undefined;
}

/** a literal value of a sink: an error when the runtime would refuse it */
export function checkSinkLiteral(where: string, sink: Sink, v: string): void {
  const ok = sink.kind === "srcset" ? srcsetUrls(v).every((u) => isSafeUrl(u, true)) : isSafeUrl(v, sink.image);
  if (!ok) throw new Error(`${where}: ${JSON.stringify(v)} is not an allowed ${sink.kind === "srcset" ? "srcset" : "URL"} (paths, #, ?, http(s), mailto, tel${sink.kind === "srcset" || sink.image ? ", data:image/*" : ""})`);
}

/** an attribute name of a view: an error when it is not a valid name or an event handler (on*), which takes `on` instead */
export function checkAttrName(where: string, name: string): void {
  if (!isSafeAttrName(name)) throw new Error(`${where}: attribute name ${JSON.stringify(name)} is not allowed (a valid name, not on*)`);
}

/** the generation-time checks of a primitive use: free attribute names, literal URL sinks of props and attributes */
export function checkUse(where: string, n: { props?: Record<string, unknown>; attrs?: Record<string, unknown> }): void {
  for (const k of Object.keys(n.attrs ?? {})) checkAttrName(where, k);
  for (const [k, v] of [...Object.entries(n.props ?? {}), ...Object.entries(n.attrs ?? {})]) {
    const sink = sinkOf(k);
    if (sink && typeof v === "string") checkSinkLiteral(`${where}.${k}`, sink, v);
  }
}

/** a computed value of a URL sink string prop through the runtime's check (`printed` is the runtime's text of the value), or undefined when name is no sink or the value a literal */
export function sinkCall(runtime: "twig" | "go", name: string, v: unknown, printed: string): string | undefined {
  const sink = sinkOf(name);
  if (!sink || v === null || typeof v !== "object") return undefined;
  if (runtime === "go") return sink.kind === "srcset" ? `uiutils.Srcset(${printed})` : `uiutils.URL(${printed}, ${sink.image})`;
  return sink.kind === "srcset" ? `og_srcset(og_s(${printed}))` : `og_url(og_s(${printed})${sink.image ? ", true" : ""})`;
}

/** the part a primitive use names, after checkUse: an error when it is unknown */
export function usedPart<T>(where: string, parts: Record<string, T | undefined>, n: { use: string; props?: Record<string, unknown>; attrs?: Record<string, unknown> }): T {
  const ref = parts[n.use];
  if (!ref) throw new Error(`${where}: unknown part ${n.use}`);
  checkUse(`${where}: ${n.use}`, n);
  return ref;
}
