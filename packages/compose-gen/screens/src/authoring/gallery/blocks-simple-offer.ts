// The simple line, wave 3: calls to action and offers (organisms in blocks/simple-offer.ts, one content model each). The group
// of each block is the Stock group of its kind (apps/stock): cta. Variants only set axes, plus the default of `align`.
import { define } from "./blocks-define";
import { t } from "./block-kit";

const k = (block: string) => (key: string) => t(`marketing.${block}.${key}`);
const h2 = { sel: "section h2", n: 1 };

const cta = k("ctaSimple");
const ctaSimple = define({
  key: "ctasimple", theme: "marketing", group: "cta", line: "simple", model: "cta@1",
  name: "Simple call to action", docs: "One band: a badge when set, the heading, one paragraph and up to two buttons; centred or at the start, or the buttons at the end; on a muted or an outlined surface.",
  organism: "CtaSimple", axes: ["layout", "surface"],
  variants: [
    ["center", "Centred band"],
    ["start", "At the start", {}, { align: "start" }],
    ["between", "Buttons at the end", { layout: "between" }, { align: "start" }],
    ["centerOutline", "Centred, outlined", { surface: "outline" }],
    ["betweenOutline", "Buttons at the end, outlined", { layout: "between", surface: "outline" }, { align: "start" }],
  ],
  facts: [h2, { sel: "section a", n: 2 }, { sel: '[data-slot="badge"]', n: 1 }],
  sample: {
    id: "ctasimple", badge: cta("badge"), title: cta("title"), description: cta("description"),
    actionLabel: cta("action"), actionHref: "#order", secondaryActionLabel: cta("secondary"), secondaryActionHref: "#menu",
  },
});

const pro = k("promoSimple");
const promoSimple = define({
  key: "promosimple", theme: "marketing", group: "cta", line: "simple", model: "promo@1",
  name: "Simple promo", docs: "One offer: the discount as a badge, the heading, the deadline as text, one paragraph, a promo code when set and one button, beside a picture at the end or at the start, or under a wide one.",
  organism: "PromoSimple", axes: ["media"],
  variants: [
    ["mediaEnd", "Picture at the end"],
    ["mediaStart", "Picture at the start", { media: "start" }],
    ["mediaTop", "Wide picture on top", { media: "top" }, { align: "center" }],
  ],
  facts: [h2, { sel: "section a", n: 1 }, { sel: '[data-slot="badge"]', n: 1 }, { sel: '[data-slot="media-frame"]', n: 1 }],
  sample: {
    id: "promosimple", badge: pro("badge"), title: pro("title"), deadline: pro("deadline"), description: pro("description"), code: pro("code"),
    actionLabel: pro("action"), actionHref: "#order", image: "", imageAlt: pro("imageAlt"),
  },
});

export const simpleOfferBlocks = [ctaSimple, promoSimple];
