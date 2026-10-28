// Rich text: the body of the current page or post (the Codex `content`, read as trusted markup) in six layouts.
import { ref } from "../../build";
import { define } from "./blocks-define";
import { t } from "./block-kit";
import * as d from "./blocks-data";

const richtext = define({
  key: "richtext", theme: "content", group: "page", name: "Rich text", docs: "The body of the current page or post as rich text (headings, lists, quotes, pictures, code, tables) under its title and a meta line; in a reading column, wide, beside a side note, under a cover, in a card, or as the page heading over a wide cover.",
  organism: "RichText", axes: ["layout"], data: [d.entry],
  variants: [
    ["narrow", "One reading column"],
    ["wide", "A wider column", { layout: "wide" }],
    ["sidebar", "The body beside a side note", { layout: "sidebar" }],
    ["media", "A cover above the body", { layout: "media" }],
    ["card", "The body in a card", { layout: "card" }],
    ["heroTitle", "The title as the page heading over a wide cover", { layout: "hero" }, { level: 1 }],
  ],
  facts: [
    { sel: '[data-testid="richtext-content"]', n: 1 },
    { sel: '[data-testid="richtext-content"] h2', n: 1 },
    { sel: '[data-testid="richtext-meta"]', n: 1 },
    { sel: '[data-testid="richtext-aside"]', n: 1, when: { layout: "sidebar" } },
    { sel: '[data-testid="richtext-aside"]', n: 0, when: { layout: ["narrow", "wide", "media", "card", "hero"] } },
    { sel: '[data-slot="media-frame"]', n: 1, when: { layout: ["media", "hero"] } },
    { sel: '[data-slot="media-frame"]', n: 0, when: { layout: ["narrow", "wide", "sidebar", "card"] } },
  ],
  sample: {
    id: "richtext", title: ref("entry.title"), content: ref("entry.content"),
    media: { src: ref("entry.image"), alt: ref("entry.title") },
    meta: { date: ref("entry.date"), author: ref("entry.author"), category: ref("entry.category") },
    aside: { title: t("content.richtext.aside"), content: ref("entry.aside") },
  },
});

export const richTextBlocks = [richtext];
