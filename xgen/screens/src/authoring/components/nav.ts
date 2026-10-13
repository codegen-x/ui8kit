// The pieces of a top bar: the links (NavLinks), the buttons at its end (NavActions), the search field
// (SearchPalette) and the faded picture a transparent bar sits on (OverMedia). NavBar, MegaMenu and SidebarNav use them.
import { and, call, coalesce, cond, eachAt, eq, lt, mul, or, ref, slot, text, undef, use, when, organism, len } from "../../build";
import type { Value, ViewNode } from "../../ir";
import { fields, spec, ts } from "../kit";
import { tsOf } from "../props";

export const NavLink = fields(["id", "string"], ["name", "string"], ["icon", "string"], ["href", "string", true]);
export const Group = fields(["id", "string"], ["title", "string"], ["icon", "string"], ["links", "string[]"]);

export const link = (l: string, current: Value): ViewNode => use("Link", { props: { Href: coalesce(ref(`${l}.href`), "#/"), Variant: "default", AriaCurrent: cond(eq(ref(`${l}.id`), current), "page", undef()), Class: "text-sm" }, attrs: { "data-testid": "nav-link" } }, text(ref(`${l}.name`)));
export const brandLink = (): ViewNode => use("Link", { props: { Href: "#/", Variant: "default", Class: "text-lg font-medium" }, attrs: { "data-testid": "brand" } }, text(ref("brand")));
const P = "pattern.";
/** the menu links of a bar: all of them, or the left or right half (the split layout puts the brand between) */
export const navLinks = spec(`${P}nav-links`, "NavLinks", "The links of a top bar in a row; the current one carries aria-current. side: all, or the first or second half of the list.", {
  typeImports: [{ from: "NavBar", names: ["NavLink"] }],
  props: [
    { name: "links", type: ts("NavLink[]"), required: true },
    { name: "current", type: "string", default: "", docs: "id of the current link" },
    { name: "side", type: tsOf("all", "left", "right"), default: "all" },
  ],
  derived: [{ name: "count", value: len(ref("links")) }],
  view: (() => {
    // a link shows on every side "all", else when its half of the list is the side asked for
    const shown = or(eq(ref("side"), "all"), eq(lt(mul(ref("i"), 2), ref("count")), eq(ref("side"), "left")));
    return [use("Group", { props: { Gap: "4", Align: "center", Class: "flex-wrap" } },
      eachAt(ref("links"), "l", "i", ref("l.id"), when(shown, [link("l", ref("current"))])))];
  })(),
});

/** the buttons at the end of a bar: login, call to action, theme */
export const navActions = spec(`${P}nav-actions`, "NavActions", "The buttons at the end of a top bar: login, the call to action and the theme button (it only reports the press). No wrapper: they sit in the row of the bar.", {
  props: [
    { name: "login", type: "string", docs: "text of the login link; none: no login" },
    { name: "loginHref", type: "string", default: "#/login" },
    { name: "cta", type: "string" },
    { name: "ctaHref", type: "string" },
    { name: "actions", type: tsOf("none", "cta"), default: "cta" },
    { name: "tone", type: tsOf("default", "inverse"), default: "default" },
    { name: "themeLabel", type: "string", docs: "text of the theme button; none: no button" },
  ],
  events: [{ name: "theme", args: [], docs: "the theme button was pressed" }],
  view: [
    when(ref("login"), [use("Button", { props: { Variant: "ghost", Size: "sm", Href: ref("loginHref"), Class: cond(eq(ref("tone"), "inverse"), "text-background hover:bg-background/10", "") }, attrs: { "data-testid": "nav-login" } }, text(ref("login")))]),
    when(and(eq(ref("actions"), "cta"), ref("cta")), [use("Button", { props: { Variant: cond(eq(ref("tone"), "inverse"), "secondary", "default"), Size: "sm", Href: ref("ctaHref") }, attrs: { "data-testid": "header-cta" } }, text(ref("cta")))]),
    when(ref("themeLabel"), [use("Button", { props: { Variant: "outline", Size: "sm" }, on: { click: call("emit.theme") }, attrs: { "data-testid": "theme-toggle" } }, text(ref("themeLabel")))]),
  ],
});

/** a search field with its keyboard shortcut, for the search layout of a bar */
export const searchPalette = spec(`${P}search-palette`, "SearchPalette", "A search field with a search glyph and the keys that open it.", {
  props: [
    { name: "label", type: "string", required: true, docs: "name and placeholder of the field" },
    { name: "shortcut", type: "string", required: true },
  ],
  view: [use("Box", { props: { Class: "relative w-full max-w-sm" }, attrs: { "data-testid": "palette" } },
    use("LucideIcon", { props: { Name: "search", Size: 16, Class: "pointer-events-none absolute top-2 left-3 text-muted-foreground" } }),
    use("Input", { props: { Type: "search", Size: "sm", Placeholder: ref("label"), AriaLabel: ref("label"), Class: "pr-12 pl-10" } }),
    use("Inline", { props: { Class: "pointer-events-none absolute top-2 right-2 rounded px-2 py-0 text-xs text-muted-foreground inset-ring inset-ring-border" } }, text(ref("shortcut"))))],
});

/** a picture behind its children (a transparent bar over a hero picture); off: the children alone */
export const overMedia = spec(`${P}over-media`, "OverMedia", "A faded picture behind the content of its header (a transparent top bar over a hero image); on false: nothing. It sits inside the header Block, which is `relative isolate overflow-hidden` and transparent when on, so the header stays the root of the block (rule 01).", {
  props: [
    { name: "on", type: "boolean", default: false },
    { name: "alt", type: "string", required: true, docs: "accessible name of the picture" },
  ],
  view: [when(ref("on"),
    [use("Box", { props: { Class: "pointer-events-none absolute inset-0 -z-10" }, attrs: { "data-testid": "over" } },
      organism("MediaFrame", { alt: ref("alt"), ratio: "21/9", className: "size-full rounded-none opacity-40" }))])],
});
