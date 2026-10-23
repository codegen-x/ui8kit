// Shared by the JS and the server parity suites: the cases of every composition and the HTML normalizer.
import { BRICKS } from "../src/map";
import { RECIPES } from "../src/recipes";

export const names = Object.entries(BRICKS).filter(([, m]) => m.recipe || m.extra || m.tag || m.tagFrom).map(([n]) => n);
// controls need an accessible name in a fixture (axe: label); the composition does not invent one
const NAMED = new Set(["Input", "Range", "Textarea", "Select", "Checkbox", "Radio", "Switch", "Meter", "Progress"]);
/** children are not rendered for void elements (and Textarea: value, not children) */
export const VOID = new Set(["Input", "Checkbox", "Radio", "Switch", "Separator", "Image", "Textarea"]);
export const isLeaf = (name: string) => VOID.has(BRICKS[name].primitive) || BRICKS[name].tag === "col";

// Runtime artifacts dropped: Svelte hydration markers <!--[-->/<!>, img onload/onerror="this.__e=event"; Solid data-hk; Vue data-v-.
// textarea value="": the installed kit is registry 3.2.0 (Solid printed it; fixed in codegen 3.2.0 / registry 3.2.2) — drop this rule after kit:install 3.2.2.
export const norm = (html: string) =>
  // ">" in text needs no escape (Svelte prints it raw, React as &gt;): same DOM; "<" and "&" stay strict
  html.replace(/&gt;/g, ">").replace(/<!--[^]*?-->/g, "").replace(/ data-hk="[^"]*"/g, "").replace(/\s*\/>/g, ">").replace(/(<textarea\b[^>]*?) value=""/g, "$1").replace(/ data-v-[a-z0-9]+(="")?/g, "").replace(/<!>/g, "").replace(/ on(load|error)="this\.__e=event"/g, "").replace(/<([a-z0-9]+)((?:\s+[^\s=>]+(?:="[^"]*")?)*)\s*\/?>/g, (_, tag, attrs: string) => {
    const list = [...attrs.matchAll(/([^\s=>]+)(?:="([^"]*)")?/g)].map(([, k, v]) => `${k}="${k === "class" ? (v ?? "").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&").split(/\s+/).filter(Boolean).join(" ") : (v ?? "").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&")}"`).filter((a) => a !== `class=""`);
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
