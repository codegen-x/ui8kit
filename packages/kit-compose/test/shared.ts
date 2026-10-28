// Shared by the JS and the server parity suites: the cases of every composition and the HTML normalizer.
import { BRICKS } from "../src/map";
import { RECIPES } from "../src/recipes";
import type { blockCases } from "../../compose-gen";

export const names = Object.entries(BRICKS).filter(([, m]) => m.recipe || m.extra || m.tag || m.tagFrom).map(([n]) => n);
// controls need an accessible name in a fixture (axe: label); the composition does not invent one
const NAMED = new Set(["Input", "Range", "Textarea", "Select", "Checkbox", "Radio", "Switch", "Meter", "Progress"]);
/** children are not rendered for void elements (and Textarea: value, not children) */
export const VOID = new Set(["Input", "Checkbox", "Radio", "Switch", "Separator", "Image", "Textarea"]);
export const isLeaf = (name: string) => VOID.has(BRICKS[name].primitive) || BRICKS[name].tag === "col";

// Runtime artifacts dropped: Svelte hydration markers <!--[-->/<!>, img onload/onerror="this.__e=event"; Solid data-hk; Vue data-v-.
export const norm = (html: string) =>
  // ">" in text needs no escape (Svelte prints it raw, React as &gt;): same DOM; "<" and "&" stay strict
  html.replace(/&gt;/g, ">").replace(/<!--[^]*?-->/g, "").replace(/ data-hk="[^"]*"/g, "").replace(/\s*\/>/g, ">").replace(/ data-v-[a-z0-9]+(="")?/g, "").replace(/<!>/g, "").replace(/ on(load|error)="this\.__e=event"/g, "").replace(/<([a-z0-9]+)((?:\s+[^\s=>]+(?:="[^"]*")?)*)\s*\/?>/g, (_, tag, attrs: string) => {
    const list = [...attrs.matchAll(/([^\s=>]+)(?:="([^"]*)")?/g)].map(([, k, v]) => `${k}="${k === "class" ? (v ?? "").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&").split(/\s+/).filter(Boolean).join(" ") : (v ?? "").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&")}"`);
    return `<${tag}${list.sort().map((a) => " " + a).join("")}>`;
  });

export function cases(name: string): Record<string, string>[] {
  const m = BRICKS[name];
  const base: Record<string, string> = NAMED.has(name) ? { "aria-label": "Field" } : {};
  const out: Record<string, string>[] = [{ ...base }, { ...base, className: "mt-4", "data-testid": "x" }];
  if (m.recipe) for (const k of RECIPES[m.recipe].keys) for (const v of Object.keys(RECIPES[m.recipe].byKey[k] ?? {})) out.push({ ...base, [k]: v });
  if (m.tagFrom?.heading) out.push({ as: "1" }, { as: "3" });
  else if (m.tagFrom) out.push({ tag: m.primitive === "Text" ? "span" : name === "List" ? "ol" : "section" });
  return out;
}

/** Hand-written compositions (src/manual.ts): props in React spelling; `aria-label` is a prop of these (default label). */
export const ITEMS = [{ label: "Home", href: "/" }, { label: "Docs <&>", href: "/docs" }, { label: "Off", href: "/off", disabled: true }, { label: "Here", current: true }];
export const MANUAL_CASES: { name: string; props: Record<string, unknown> }[] = [
  ...["ThemeToggle", "SheetTrigger", "SheetClose"].flatMap((name) => [
    { name, props: {} },
    { name, props: { variant: "ghost", size: "sm", className: "mt-4", "aria-label": "Custom" } },
    { name, props: { variant: "contrast", size: "lg", "data-testid": "x" } },
  ]),
  { name: "SheetTrigger", props: { controls: "menu" } },
  { name: "Breadcrumb", props: {} },
  { name: "Breadcrumb", props: { items: ITEMS, className: "mt-4", "aria-label": "Trail" } },
];

type OrgCase = ReturnType<typeof blockCases>["cases"][number];
/** TrustedHtml on every runtime (RichText): the same markup as a plain string is escaped, as TrustedHtml (`{ __html }`, what the
 *  `|html` pipe of readPath gives) it is printed as it is */
export const MARKUP = "<b>bold</b> & <i>it</i>";
export const ESCAPED = "&lt;b&gt;bold&lt;/b&gt; &amp; &lt;i&gt;it&lt;/i&gt;";
export const RAW = "<b>bold</b> &amp; <i>it</i>";
/** the probes after the gallery cases: a plain string, TrustedHtml, and the heroTitle variant as the page heading (level 1, the
 *  gallery draws every variant at level 2) */
export function trustedProbes(gallery: OrgCase[]): OrgCase[] {
  const at = (v: string) => gallery.find((c) => c.label.startsWith(`richtext.${v} `))!.props;
  return [
    { label: "probe.richtext.plain (RichText)", organism: "RichText", props: { ...at("narrow"), id: "probe-plain", content: MARKUP } },
    { label: "probe.richtext.trusted (RichText)", organism: "RichText", props: { ...at("narrow"), id: "probe-trusted", content: { __html: RAW } } },
    { label: "probe.richtext.page (RichText)", organism: "RichText", props: { ...at("heroTitle"), id: "probe-page", level: 1 } },
  ];
}
/** what a probe must show: a plain string escaped, TrustedHtml raw; the gallery variants no h1 (level 2), the page heading one */
export function probeProblems(label: string, html: string): string[] {
  const out: string[] = [];
  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  if (label.startsWith("probe.richtext.plain") && (!html.includes(ESCAPED) || html.includes("<b>bold</b>"))) out.push(`${label}: a plain string is not escaped`);
  if (label.startsWith("probe.richtext.trusted") && (!html.includes(RAW) || html.includes("&lt;b&gt;"))) out.push(`${label}: TrustedHtml is not printed as it is`);
  if (label.startsWith("probe.richtext.page") && h1 !== 1) out.push(`${label}: ${h1} h1, want 1`);
  if (label.startsWith("richtext.") && h1 !== 0) out.push(`${label}: ${h1} h1 at level 2`);
  if (label.startsWith("richtext.") && !html.includes("<h2>How we work</h2>")) out.push(`${label}: the fixture markup is not printed as it is`);
  return out;
}
