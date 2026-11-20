// The simple line, wave 3 (calls to action and offers; one content model each, specs/models): CtaSimple (cta@1), PromoSimple (promo@1).
// The rules of simple.ts: the props are the fields of the model plus the axes and the settings; only the compositions
// packages/prototypes lowers (Box, Block, Container, Stack, Group, List, ListItem, LinkPlain; Title, Text, Badge, LinkButton, MediaFrame).
import { cn, ref, text, use, when, organism } from "../../build";
import type { OrganismSpec } from "../../ir";
import { spec } from "../kit";
import { id, title, tsOf } from "../props";
import { O, level, description, titleId, padding, teamDerived, alignItems, textAlign, section, lead, action, actions, actionProps, align } from "./simple";
import { badge, centered, chain, is } from "./simple-more";

const str = (name: string, docs: string, required = false) => (required ? { name, type: "string" as const, required: true, docs } : { name, type: "string" as const, default: "", docs });
const actionPair = [str("actionLabel", "the label of the action; the link is drawn when the label and the address are both set"), str("actionHref", "the address of the action")];
const image = str("image", "address of the picture; none: the placeholder");
const imageAlt = str("imageAlt", "alt text of the picture", true);
const axis = (name: string, ...values: string[]) => ({ name, type: tsOf(...values), default: values[0] });
const pill = when(ref("badge"), [use("Badge", { props: { Variant: "secondary" } }, text(ref("badge")))]);

// ---- CtaSimple (cta@1): one band: a badge, the heading, a line and up to two actions, on a muted or an outlined surface
const ctaSimple = spec(`${O}cta-simple`, "CtaSimple", "The simple call to action (model cta@1): one band with an optional badge, the heading, a description and up to two links styled as buttons (the first primary, the second secondary; each drawn when its label and its address are both set). Text only (a picture beside the copy is the split or the hero). Axes: layout (stack: the copy and the actions in one column, placed by the align setting; between: the copy at the start, the actions at the end from md up), surface (muted: a muted band, outline: a bordered card).", {
  props: [id, badge, title, description, ...actionProps, level, padding, centered, axis("layout", "stack", "between"), axis("surface", "muted", "outline")],
  derived: [
    titleId, ...teamDerived,
    chain("frame", [[is("layout", "between"), "flex flex-col gap-8 md:flex-row md:items-center md:justify-between"]], "flex flex-col gap-6"),
    chain("band", [[is("surface", "outline"), "rounded border border-border bg-card p-8 text-card-foreground md:p-12"]], "rounded bg-muted p-8 md:p-12"),
  ],
  view: [section(
    use("Box", { props: { Class: cn(ref("band"), ref("frame")) } },
      use("Stack", { props: { Gap: "4", Align: alignItems } },
        pill,
        use("Title", { props: { As: ref("level"), Size: "3xl", Weight: "bold", Class: cn("max-w-2xl tracking-tight", textAlign) }, attrs: { id: ref("titleId") } }, text(ref("title"))),
        lead("lg")),
      actions(alignItems)))],
});

// ---- PromoSimple (promo@1): one offer with a deadline: the discount as a badge, the heading, the deadline, a line, a code and the action; a picture
const promoSimple = spec(`${O}promo-simple`, "PromoSimple", "The simple promo (model promo@1): one offer with the discount as a badge, the heading, the deadline as text (no countdown), a description, an optional promo code, one action and a picture. Axes: media (end: the picture after the copy from md up, start: before it, top: above it, wide).", {
  props: [id, badge, title, str("deadline", "the deadline of the offer as it is shown (until 31 December)", true), description, str("code", "a promo code; empty: none"), ...actionPair, image, imageAlt, level, padding, align, axis("media", "end", "start", "top")],
  derived: [
    titleId, ...teamDerived,
    chain("frame", [[is("media", "top"), "flex flex-col gap-8"]], "grid grid-cols-1 items-center gap-12 md:grid-cols-2"),
    chain("pictureCell", [[is("media", "end"), "w-full"]], "order-first w-full"),
    chain("ratio", [[is("media", "top"), "21/9"]], "4/3"),
  ],
  view: [section(
    use("Box", { props: { Class: ref("frame") } },
      use("Stack", { props: { Gap: "4", Align: alignItems } },
        when(ref("badge"), [use("Badge", { props: { Variant: "default" } }, text(ref("badge")))]),
        use("Title", { props: { As: ref("level"), Size: "4xl", Weight: "bold", Class: cn("max-w-2xl tracking-tight", textAlign) }, attrs: { id: ref("titleId") } }, text(ref("title"))),
        use("Text", { props: { Size: "base", Weight: "semibold", Class: cn("text-primary", textAlign) } }, text(ref("deadline"))),
        lead("lg"),
        when(ref("code"), [use("Text", { props: { Size: "sm", Class: cn("rounded border border-border px-4 py-2", textAlign) } }, text(ref("code")))]),
        action("actionLabel", "actionHref", "default")),
      use("Box", { props: { Class: ref("pictureCell") } },
        organism("MediaFrame", { alt: ref("imageAlt"), src: ref("image"), ratio: ref("ratio"), className: "rounded" }))))],
});

export const simpleOfferOrganisms: OrganismSpec[] = [ctaSimple, promoSimple];
