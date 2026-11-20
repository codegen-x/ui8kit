// The simple line, wave 3 (calls to action and offers; one content model each, specs/models): CtaSimple (cta@1).
// The rules of simple.ts: the props are the fields of the model plus the axes and the settings; only the compositions
// packages/prototypes lowers (Box, Block, Container, Stack, Group, List, ListItem, LinkPlain; Title, Text, Badge, LinkButton, MediaFrame).
import { cn, ref, text, use, when } from "../../build";
import type { OrganismSpec } from "../../ir";
import { spec } from "../kit";
import { id, title, tsOf } from "../props";
import { O, level, description, titleId, padding, teamDerived, alignItems, textAlign, section, lead, actions, actionProps } from "./simple";
import { badge, centered, chain, is } from "./simple-more";

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

export const simpleOfferOrganisms: OrganismSpec[] = [ctaSimple];
