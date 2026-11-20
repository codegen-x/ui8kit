// The simple line, wave 2: content and the page frame (organisms in blocks/simple-content.ts, one content model each). The group of
// each block is the Stock group of its kind (apps/stock): the header and the footer are navigation, the event and the profile intro
// open a page (hero), the rating is proof, the error page is a state, the long read (article, lead, figure, pull quote, chapters) is a
// story, the topics are the blog. Variants only set axes, plus the default of `align` where the composition is centred or at the start.
import { ref } from "../../build";
import { define } from "./blocks-define";
import { t } from "./block-kit";
import * as d from "./blocks-data";

const k = (block: string) => (key: string) => t(`marketing.${block}.${key}`);
const h2 = { sel: "section h2", n: 1 };
const media1 = { sel: '[data-slot="media-frame"]', n: 1 };
const button = (n: number) => ({ sel: 'a[data-slot="button"][href]', n });

const fs = k("featureShowcaseSimple");
const featureShowcase = define({
  key: "featureshowcasesimple", theme: "marketing", group: "features", line: "simple", model: "feature-showcase@1",
  name: "Simple feature showcase", docs: "The heading, one paragraph and the key points as a list beside one picture (at the end or the start), or the head over a wide picture with the points in three columns under it.",
  organism: "FeatureShowcaseSimple", axes: ["media"], data: [d.showcaseItems],
  variants: [
    ["mediaEnd", "Picture at the end"],
    ["mediaStart", "Picture at the start", { media: "start" }],
    ["mediaTop", "Picture above the points", { media: "top" }, { align: "center" }],
  ],
  facts: [h2, { sel: "ul > li", n: "@showcaseItems" }, { sel: "ul > li h3", n: "@showcaseItems" }, media1],
  sample: { id: "featureshowcasesimple", title: fs("title"), description: fs("description"), imageAlt: fs("imageAlt"), items: ref("showcaseItems") },
});

const hd = k("headerSimple");
const headerSimple = define({
  key: "headersimple", theme: "marketing", group: "navigation", line: "simple", model: "header@1",
  name: "Simple header", docs: "The brand as the link home, the navigation links and one action in a bar: the links in the middle, at the end beside the action, or centred under the brand. No menu button: the links wrap on a narrow screen.",
  organism: "HeaderSimple", axes: ["layout"], data: [d.headerLinks],
  variants: [
    ["inline", "Links in the middle"],
    ["linksEnd", "Links at the end", { layout: "end" }],
    ["centered", "Centred under the brand", { layout: "centered" }],
  ],
  facts: [{ sel: "header", n: 1 }, { sel: "header li", n: "@headerLinks" }, { sel: "header ul a[href]", n: "@headerLinks" }, button(1), { sel: "button", n: 0 }],
  sample: { id: "headersimple", brand: hd("brand"), brandHref: "#/", links: ref("headerLinks"), actionLabel: hd("actionLabel"), actionHref: "#/start" },
});

const ft = k("footerSimple");
const footerSimple = define({
  key: "footersimple", theme: "marketing", group: "navigation", line: "simple", model: "footer@1",
  name: "Simple footer", docs: "The brand and one line beside the links (a row or a grid of columns), or everything centred; the copyright line under them.",
  organism: "FooterSimple", axes: ["layout"], data: [d.footerLinks],
  variants: [
    ["brandLinks", "The brand beside a row of links"],
    ["linkGrid", "Links in columns", { layout: "grid" }],
    ["centered", "Centred", { layout: "centered" }],
  ],
  facts: [{ sel: "footer", n: 1 }, { sel: "footer li", n: "@footerLinks" }, { sel: "footer a[href]", n: "@footerLinks" }],
  sample: { id: "footersimple", brand: ft("brand"), description: ft("description"), links: ref("footerLinks"), copyright: ft("copyright") },
});

const ev = k("eventIntro");
const eventIntro = define({
  key: "eventintro", theme: "marketing", group: "hero", line: "simple", model: "event@1",
  name: "Event intro", docs: "The first screen of an event: a badge, the name as a large heading, one paragraph, the date and the place, and one action; centred or at the start.",
  organism: "EventIntro", axes: [],
  variants: [
    ["center", "Centred"],
    ["start", "At the start", {}, { align: "start" }],
  ],
  facts: [h2, { sel: '[data-slot="badge"]', n: 1 }, { sel: "ul > li", n: 2 }, button(1), { sel: '[data-slot="media-frame"]', n: 0 }],
  sample: { id: "eventintro", badge: ev("badge"), title: ev("title"), description: ev("description"), date: ev("date"), place: ev("place"), actionLabel: ev("actionLabel"), actionHref: "#/tickets" },
});

const pr = k("profileIntro");
const profileIntro = define({
  key: "profileintro", theme: "marketing", group: "hero", line: "simple", model: "profile@1",
  name: "Profile intro", docs: "A person: the name, the role, one paragraph and the links beside the portrait (at the end or the start), or under a round portrait.",
  organism: "ProfileIntro", axes: ["media"], data: [d.profileLinks],
  variants: [
    ["portraitEnd", "Portrait at the end"],
    ["portraitStart", "Portrait at the start", { media: "start" }],
    ["portraitTop", "Round portrait above", { media: "top" }, { align: "center" }],
  ],
  facts: [h2, { sel: "ul > li", n: "@profileLinks" }, button(3), media1],
  sample: { id: "profileintro", title: pr("title"), role: pr("role"), description: pr("description"), imageAlt: pr("imageAlt"), links: ref("profileLinks") },
});

const ra = k("ratingSimple");
const ratingSimple = define({
  key: "ratingsimple", theme: "marketing", group: "proof", line: "simple", model: "rating@1",
  name: "Simple rating", docs: "The score, what it is and the source as a link: one bar on a card surface, or centred.",
  organism: "RatingSimple", axes: ["layout"],
  variants: [
    ["inline", "A bar"],
    ["centered", "Centred", { layout: "centered" }],
  ],
  facts: [h2, { sel: "section a[href]", n: 1 }],
  sample: { id: "ratingsimple", value: "4.9", title: ra("title"), description: ra("description"), sourceLabel: ra("sourceLabel"), sourceHref: "#/reviews" },
});

const er = k("errorSimple");
const errorSimple = define({
  key: "errorsimple", theme: "marketing", group: "states", line: "simple", model: "error@1",
  name: "Simple error", docs: "A page for something that went wrong: the code, the heading, one paragraph and one action back; centred or at the start.",
  organism: "ErrorSimple", axes: [],
  variants: [
    ["center", "Centred"],
    ["start", "At the start", {}, { align: "start" }],
  ],
  facts: [h2, button(1), { sel: '[data-slot="media-frame"]', n: 0 }],
  sample: { id: "errorsimple", code: "404", title: er("title"), description: er("description"), actionLabel: er("actionLabel"), actionHref: "#/" },
});

const fi = k("figureSimple");
const figureSimple = define({
  key: "figuresimple", theme: "marketing", group: "story", line: "simple", model: "figure@1",
  name: "Simple figure", docs: "One large picture with its caption (a title, a line, the credit): wide with the caption under it, or the caption at the side.",
  organism: "FigureSimple", axes: ["layout"],
  variants: [
    ["wide", "Wide, the caption under it"],
    ["captionEnd", "The caption at the end", { layout: "end" }],
    ["captionStart", "The caption at the start", { layout: "start" }],
  ],
  facts: [{ sel: "section figure", n: 1 }, { sel: "figure h2", n: 0 }, media1],
  sample: { id: "figuresimple", imageAlt: fi("imageAlt"), title: fi("title"), description: fi("description"), credit: fi("credit") },
});

const pq = k("pullQuoteSimple");
const pullQuote = define({
  key: "pullquotesimple", theme: "marketing", group: "story", line: "simple", model: "pull-quote@1",
  name: "Simple pull quote", docs: "The words of a quote in large type with the author, a role line and the source under them: a bar at the side, or centred.",
  organism: "PullQuoteSimple", axes: ["layout"],
  variants: [
    ["standalone", "A bar at the side"],
    ["centered", "Centred", { layout: "centered" }],
  ],
  facts: [{ sel: "figure blockquote", n: 1 }, { sel: "section a[href]", n: 1 }],
  sample: { id: "pullquotesimple", quote: pq("quote"), title: pq("title"), description: pq("description"), sourceLabel: pq("sourceLabel"), sourceHref: "#/interview" },
});

const ar = k("articleSimple");
const articleSimple = define({
  key: "articlesimple", theme: "marketing", group: "story", line: "simple", model: "article@1",
  name: "Simple article", docs: "The heading, one paragraph and the sections of a text (a subheading and its paragraph): one reading column, or two columns under a centred head.",
  organism: "ArticleSimple", axes: ["layout"], data: [d.articleSections],
  variants: [
    ["column", "One reading column", {}, { align: "start" }],
    ["twoColumns", "Two columns", { layout: "columns" }, { align: "center" }],
  ],
  facts: [h2, { sel: "section h3", n: "@articleSections" }],
  sample: { id: "articlesimple", title: ar("title"), description: ar("description"), sections: ref("articleSections") },
});

const al = k("articleLead");
const articleLead = define({
  key: "articlelead", theme: "marketing", group: "story", line: "simple", model: "article-lead@1",
  name: "Article lead", docs: "The head of an article: the heading, the lead paragraph and the byline (the portrait, the author, the date) under a wide cover, or beside it.",
  organism: "ArticleLead", axes: ["media"],
  variants: [
    ["mediaTop", "Cover above"],
    ["mediaStart", "Cover at the start", { media: "start" }],
    ["mediaEnd", "Cover at the end", { media: "end" }],
  ],
  facts: [h2, { sel: '[data-slot="media-frame"]', n: 2 }],
  sample: { id: "articlelead", title: al("title"), description: al("description"), imageAlt: al("imageAlt"), author: al("author"), date: al("date") },
});

const to = k("topicsSimple");
const topicsSimple = define({
  key: "topicssimple", theme: "marketing", group: "blog", line: "simple", model: "topics@1",
  name: "Simple topics", docs: "The heading, one paragraph and the rubrics of a blog on cards (a label, the title as a link, a line): in two or three columns, or one under the other.",
  organism: "TopicsSimple", axes: ["layout", "cols"], data: [d.topicItems],
  variants: [
    ["cards3", "Three columns"],
    ["cards2", "Two columns", { cols: "2" }],
    ["rows", "One under the other", { layout: "rows" }],
  ],
  facts: [h2, { sel: "ul > li", n: "@topicItems" }, { sel: "ul > li h3", n: "@topicItems" }, { sel: '[data-slot="badge"]', n: "@topicItems" }],
  sample: { id: "topicssimple", title: to("title"), description: to("description"), items: ref("topicItems") },
});

const ch = k("chaptersSimple");
const chaptersSimple = define({
  key: "chapterssimple", theme: "marketing", group: "story", line: "simple", model: "chapters@1",
  name: "Simple chapters", docs: "The heading, one paragraph and the chapters (a picture, a label, the title, a paragraph): rows with the picture at the side, or a pair with the picture under the copy.",
  organism: "ChaptersSimple", axes: ["layout"], data: [d.chapterItems],
  variants: [
    ["illustratedRows", "Rows with pictures"],
    ["paired", "A pair", { layout: "paired" }],
  ],
  facts: [h2, { sel: "ul > li", n: "@chapterItems" }, { sel: "ul > li h3", n: "@chapterItems" }, { sel: '[data-slot="media-frame"]', n: "@chapterItems" }],
  sample: { id: "chapterssimple", title: ch("title"), description: ch("description"), items: ref("chapterItems") },
});

export const simpleContentBlocks = [
  featureShowcase, headerSimple, footerSimple, eventIntro, profileIntro, ratingSimple, errorSimple, figureSimple, pullQuote, articleSimple, articleLead, topicsSimple, chaptersSimple,
];
