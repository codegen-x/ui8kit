// The simple line, more blocks (organisms in blocks/simple-more.ts, one content model each). The group of each block is the Stock
// group of its kind (apps/stock): the intro and the gallery hero open a page (hero), stats / testimonials / logos are proof, stories
// are blog posts, photos sit with the company, steps are how-it-works. Variants only set axes, plus the default of `align` where the
// composition is centred or at the start; the facts name semantic elements and data-slot hooks.
import { ref } from "../../build";
import { define } from "./blocks-define";
import { t } from "./block-kit";
import * as d from "./blocks-data";

const k = (block: string) => (key: string) => t(`marketing.${block}.${key}`);
const h2 = { sel: "section h2", n: 1 };
const actionPair = (c: (key: string) => ReturnType<typeof t>) => ({
  actionLabel: c("actionLabel"), actionHref: "#/start", secondaryActionLabel: c("secondaryActionLabel"), secondaryActionHref: "#/tour",
});

const intro = k("introSimple");
const introSimple = define({
  key: "introsimple", theme: "marketing", group: "hero", line: "simple", model: "intro@1",
  name: "Simple intro", docs: "Text only: a badge, a large heading, one paragraph and up to two links as the actions (primary, then secondary), centred or at the start, in the middle of the section or low in a tall one.",
  organism: "IntroSimple", axes: ["place"],
  variants: [
    ["center", "Centred"],
    ["start", "At the start", {}, { align: "start" }],
    ["bottomStart", "Low in the section, at the start", { place: "bottom" }, { align: "start" }],
    ["bottomCenter", "Low in the section, centred", { place: "bottom" }],
  ],
  facts: [h2, { sel: '[data-slot="badge"]', n: 1 }, { sel: 'a[data-slot="button"][href]', n: 2 }, { sel: "button", n: 0 }, { sel: '[data-slot="media-frame"]', n: 0 }],
  sample: { id: "introsimple", badge: intro("badge"), title: intro("title"), description: intro("description"), ...actionPair(intro) },
});

const gal = k("galleryHero");
const galleryHero = define({
  key: "galleryhero", theme: "marketing", group: "hero", line: "simple", model: "gallery@1",
  name: "Gallery hero", docs: "The heading, one paragraph and up to two links as the actions beside three or four photos: at the end, at the start, or in a row under the copy.",
  organism: "GalleryHero", axes: ["media", "count"], data: [d.galleryPhotos, d.galleryPhotos4],
  variants: [
    ["photos3", "Three photos at the end"],
    ["photos4", "Four photos at the end", { count: "4" }, { photos: ref("galleryPhotos4") }],
    ["photos3Start", "Three photos at the start", { media: "start" }],
    ["photos4Start", "Four photos at the start", { media: "start", count: "4" }, { photos: ref("galleryPhotos4") }],
    ["photos3Bottom", "Three photos under the copy", { media: "bottom" }, { align: "center" }],
    ["photos4Bottom", "Four photos under the copy", { media: "bottom", count: "4" }, { align: "center", photos: ref("galleryPhotos4") }],
  ],
  facts: [h2, { sel: 'a[data-slot="button"][href]', n: 2 }, { sel: "ul > li", n: "$count" }, { sel: '[data-slot="media-frame"]', n: "$count" }],
  sample: { id: "galleryhero", title: gal("title"), description: gal("description"), ...actionPair(gal), photos: ref("galleryPhotos") },
});

const fea = k("featuresSimple");
const featuresSimple = define({
  key: "featuressimple", theme: "marketing", group: "features", line: "simple", model: "features@1",
  name: "Simple features", docs: "The heading, one paragraph and the features as a list (an icon disc, a title, a line): in columns under the heading or beside it, the icon on top or at the side.",
  organism: "FeaturesSimple", axes: ["layout", "cols", "marker"], data: [d.simpleFeatures],
  variants: [
    ["cols3", "Three columns"],
    ["cols2", "Two columns", { cols: "2" }],
    ["cols4", "Four columns", { cols: "4" }],
    ["summaryRow", "The heading beside a row of three", { layout: "aside" }, { align: "start" }],
    ["summaryGrid", "The heading beside a 2 x 2 grid", { layout: "aside", cols: "2" }, { align: "start" }],
    ["inlineGrid", "Icons at the side, two columns", { cols: "2", marker: "inline" }],
    ["checklist", "The heading beside a list with icons at the side", { layout: "aside", cols: "2", marker: "inline" }, { align: "start" }],
  ],
  facts: [h2, { sel: "ul > li", n: "@simpleFeatures" }, { sel: "ul > li h3", n: "@simpleFeatures" }, { sel: '[data-slot="media-frame"]', n: "@simpleFeatures" }],
  sample: { id: "featuressimple", title: fea("title"), description: fea("description"), items: ref("simpleFeatures") },
});

const sta = k("statsSimple");
const statsSimple = define({
  key: "statssimple", theme: "marketing", group: "proof", line: "simple", model: "stats@1",
  name: "Simple stats", docs: "The heading, one paragraph and the figures as a list (a large value, a label, a note), in two, three or four columns, plain or on cards.",
  organism: "StatsSimple", axes: ["cols", "surface"], data: [d.simpleStats],
  variants: [
    ["cols4", "Four figures"],
    ["cols3", "Three columns", { cols: "3" }],
    ["cols2", "Two columns", { cols: "2" }],
    ["cards4", "Four figures on cards", { surface: "cards" }],
  ],
  facts: [h2, { sel: "ul > li", n: "@simpleStats" }, { sel: "ul > li h3", n: "@simpleStats" }, { sel: '[data-slot="card"]', n: "@simpleStats", when: { surface: "cards" } }, { sel: '[data-slot="card"]', n: 0, when: { surface: "plain" } }],
  sample: { id: "statssimple", title: sta("title"), description: sta("description"), items: ref("simpleStats") },
});

const sto = k("storiesSimple");
const storiesSimple = define({
  key: "storiessimple", theme: "marketing", group: "blog", line: "simple", model: "stories@1",
  name: "Simple stories", docs: "The heading, one paragraph and the stories as a list (a cover, the title as a link, a line): cards in two or three columns, or compact rows on a card surface.",
  organism: "StoriesSimple", axes: ["layout", "cols"], data: [d.simpleStories],
  variants: [
    ["cols3", "Three columns"],
    ["duo", "Two columns, wide covers", { cols: "2" }],
    ["related3", "Compact rows on cards", { layout: "compact" }],
  ],
  facts: [h2, { sel: "ul > li", n: "@simpleStories" }, { sel: "ul > li h3", n: "@simpleStories" }, { sel: '[data-slot="media-frame"]', n: "@simpleStories" }],
  sample: { id: "storiessimple", title: sto("title"), description: sto("description"), stories: ref("simpleStories") },
});

const pho = k("photosSimple");
const photosSimple = define({
  key: "photossimple", theme: "marketing", group: "company", line: "simple", model: "photos@1",
  name: "Simple photos", docs: "The heading, one paragraph and the photos as a list in two, three or four columns.",
  organism: "PhotosSimple", axes: ["cols"], data: [d.simplePhotos],
  variants: [
    ["row4", "Four in a row"],
    ["grid3", "Three columns", { cols: "3" }],
    ["diptych", "A pair", { cols: "2" }],
  ],
  facts: [h2, { sel: "ul > li", n: "@simplePhotos" }, { sel: '[data-slot="media-frame"]', n: "@simplePhotos" }],
  sample: { id: "photossimple", title: pho("title"), description: pho("description"), photos: ref("simplePhotos") },
});

const tes = k("testimonialsSimple");
const testimonialsSimple = define({
  key: "testimonialssimple", theme: "marketing", group: "proof", line: "simple", model: "testimonials@1",
  name: "Simple testimonials", docs: "The heading, one paragraph and the quotes as a list (the words, a portrait, the name and the role): on cards in two or three columns, in rows with the portrait at the side, or centred.",
  organism: "TestimonialsSimple", axes: ["layout", "cols"], data: [d.simpleQuotes],
  variants: [
    ["cols3", "Three cards"],
    ["cards2", "Two long quotes on cards", { cols: "2" }],
    ["portraitRows", "Portraits at the side", { layout: "rows" }],
    ["centered", "Centred quotes", { layout: "centered" }],
  ],
  facts: [h2, { sel: "ul > li", n: "@simpleQuotes" }, { sel: "ul > li h3", n: "@simpleQuotes" }, { sel: '[data-slot="media-frame"]', n: "@simpleQuotes" }],
  sample: { id: "testimonialssimple", title: tes("title"), description: tes("description"), quotes: ref("simpleQuotes") },
});

const log = k("logosSimple");
const logosSimple = define({
  key: "logossimple", theme: "marketing", group: "proof", line: "simple", model: "logos@1",
  name: "Simple logos", docs: "A short heading over the logos as a list: a wrapping row or a grid of cards.",
  organism: "LogosSimple", axes: ["surface"], data: [d.simpleLogos],
  variants: [
    ["row", "Logos in a row"],
    ["cards", "Logos on cards", { surface: "cards" }],
  ],
  facts: [h2, { sel: "ul > li", n: "@simpleLogos" }, { sel: '[data-slot="media-frame"]', n: "@simpleLogos" }],
  sample: { id: "logossimple", title: log("title"), logos: ref("simpleLogos") },
});

const faq = k("faqSimple");
const faqSimple = define({
  key: "faqsimple", theme: "marketing", group: "faq", line: "simple", model: "faq@1",
  name: "Simple FAQ", docs: "The heading, one paragraph and the questions with their answers as a list, each under a rule, in two columns or one.",
  organism: "FaqSimple", axes: ["columns"], data: [d.simpleQuestions],
  variants: [
    ["grid2", "Two columns"],
    ["list", "One column", { columns: "one" }],
  ],
  facts: [h2, { sel: "ul > li", n: "@simpleQuestions" }, { sel: "ul > li h3", n: "@simpleQuestions" }, { sel: "button", n: 0 }],
  sample: { id: "faqsimple", title: faq("title"), description: faq("description"), items: ref("simpleQuestions") },
});

const ste = k("stepsSimple");
const stepsSimple = define({
  key: "stepssimple", theme: "marketing", group: "how-it-works", line: "simple", model: "steps@1",
  name: "Simple steps", docs: "The heading, one paragraph and the steps as an ordered list (a label, a title, a line), in a row of three or four, or one under the other.",
  organism: "StepsSimple", axes: ["layout", "cols"], data: [d.simpleSteps],
  variants: [
    ["row4", "Four steps in a row"],
    ["row3", "Three columns", { cols: "3" }],
    ["column", "One under the other", { layout: "column" }, { align: "start" }],
  ],
  facts: [h2, { sel: "ol > li", n: "@simpleSteps" }, { sel: "ol > li h3", n: "@simpleSteps" }, { sel: '[data-slot="badge"]', n: "@simpleSteps" }],
  sample: { id: "stepssimple", title: ste("title"), description: ste("description"), steps: ref("simpleSteps") },
});

export const simpleMoreBlocks = [introSimple, galleryHero, featuresSimple, statsSimple, storiesSimple, photosSimple, testimonialsSimple, logosSimple, faqSimple, stepsSimple];
