// The simple line (line "simple", one content model each): HeroSimple (hero@1), SplitSimple (split@1), TeamSimple (team@1) and the
// blocks of blocks-simple-more.ts. Every variant reads the same
// content; the variants only set axes, plus the default of the `align` setting where the composition is centred (HeroSimple mediaTop:
// the wide picture on top, the copy centred under it). align stays a setting in props (a saved block overrides it), never a variant
// of its own, so the feed does not grow. The facts name data-slot hooks and semantic elements (no data-testid in the output).
import { ref } from "../../build";
import { define } from "./blocks-define";
import { t } from "./block-kit";
import * as d from "./blocks-data";
import { simpleMoreBlocks } from "./blocks-simple-more";
import { simpleContentBlocks } from "./blocks-simple-content";
import { simpleCommerceBlocks } from "./blocks-simple-commerce";
import { simpleVenueBlocks } from "./blocks-simple-venue";

const h = (k: string) => t(`marketing.heroSimple.${k}`);
const m = (k: string) => t(`marketing.teamSimple.${k}`);

const heroSimple = define({
  key: "herosimple", theme: "marketing", group: "hero", line: "simple", model: "hero@1",
  name: "Simple hero", docs: "A badge, the heading, one paragraph and up to two links as the actions (primary, then secondary), with one picture at the end, at the start (landscape or portrait), on top or at the bottom.",
  organism: "HeroSimple", axes: ["media", "ratio"],
  variants: [
    ["mediaEnd", "Picture at the end"],
    ["mediaStart", "Picture at the start", { media: "start" }],
    ["mediaTop", "Wide picture on top", { media: "top" }, { align: "center" }],
    ["mediaBottom", "Wide picture at the bottom", { media: "bottom" }, { align: "center" }],
    ["mediaEndPortrait", "Portrait picture at the end", { ratio: "portrait" }],
    ["mediaStartPortrait", "Portrait picture at the start", { media: "start", ratio: "portrait" }],
  ],
  facts: [
    { sel: "section h2", n: 1 },
    { sel: '[data-slot="badge"]', n: 1 },
    { sel: 'a[data-slot="button"][href]', n: 2 },
    { sel: "button", n: 0 },
    { sel: '[data-slot="media-frame"]', n: 1 },
  ],
  sample: {
    id: "herosimple", badge: h("badge"), title: h("title"), description: h("description"), imageAlt: h("imageAlt"),
    actionLabel: h("actionLabel"), actionHref: "#/start", secondaryActionLabel: h("secondaryActionLabel"), secondaryActionHref: "#/tour",
  },
});

const sp = (k: string) => t(`marketing.splitSimple.${k}`);
const splitSimple = define({
  key: "splitsimple", theme: "marketing", group: "split", line: "simple", model: "split@1",
  name: "Simple split", docs: "Two halves: the heading, one paragraph and up to two links as the actions (primary, then secondary) beside one picture that fills its half to the edge of the screen.",
  organism: "SplitSimple", axes: ["media"],
  variants: [
    ["mediaEnd", "Picture at the end, to the edge"],
    ["mediaStart", "Picture at the start, to the edge", { media: "start" }],
  ],
  facts: [
    { sel: "section h2", n: 1 },
    { sel: 'a[data-slot="button"][href]', n: 2 },
    { sel: "button", n: 0 },
    { sel: '[data-slot="media-frame"]', n: 1 },
    { sel: '[data-slot="media-frame"].rounded-none', n: 1 },
  ],
  sample: {
    id: "splitsimple", title: sp("title"), description: sp("description"), imageAlt: sp("imageAlt"),
    actionLabel: sp("actionLabel"), actionHref: "#/start", secondaryActionLabel: sp("secondaryActionLabel"), secondaryActionHref: "#/tour",
  },
});

const teamSimple = define({
  key: "teamsimple", theme: "marketing", group: "company", line: "simple", model: "team@1",
  name: "Simple team", docs: "The heading, one paragraph and the people as a list: a portrait, the name and the role, in two, three or four columns, plain or on cards.",
  organism: "TeamSimple", axes: ["layout", "cols", "surface"], data: [d.teamMembers],
  variants: [
    ["cols3", "Three columns"],
    ["cols2", "Two columns", { cols: "2" }],
    ["cols4", "Four columns", { cols: "4" }],
    ["cards3", "Three columns on cards", { surface: "cards" }],
    ["portraitRow", "The heading beside large portraits", { layout: "aside" }, { align: "start" }],
    ["bylineCols3", "Small portraits beside the names, on cards", { layout: "byline", surface: "cards" }, { align: "start" }],
    ["sideList", "A compact list in two columns", { layout: "list", cols: "2" }, { align: "start" }],
  ],
  facts: [
    { sel: "section h2", n: 1 },
    { sel: "ul > li", n: "@members" },
    { sel: "ul > li h3", n: "@members" },
    { sel: '[data-slot="media-frame"]', n: "@members" },
    { sel: "ul > li", cols: 2, when: { cols: "2" } },
    { sel: "ul > li", cols: 3, when: { cols: "3" } },
    { sel: "ul > li", cols: 4, when: { cols: "4" } },
    { sel: "ul > li.bg-card", n: "@members", when: { surface: "cards" } },
    { sel: "ul > li.bg-card", n: 0, when: { surface: "plain" } },
  ],
  sample: { id: "teamsimple", title: m("title"), description: m("description"), members: ref("teamMembers") },
});

export const simpleBlocks = [heroSimple, splitSimple, teamSimple, ...simpleMoreBlocks, ...simpleContentBlocks, ...simpleCommerceBlocks, ...simpleVenueBlocks];
