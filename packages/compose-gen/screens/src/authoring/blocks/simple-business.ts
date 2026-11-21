// The simple line, wave 3 (IT and small business; one content model each, specs/models): ServicesSimple (services@1), CasesSimple (cases@1), TimelineSimple (timeline@1), DigitalSimple (digital@1).
// The rules of simple.ts: the props are the fields of the model plus the axes and the settings; only the compositions
// packages/prototypes lowers (Box, Block, Container, Stack, Group, List, ListItem, LinkPlain; Title, Text, Badge, LinkButton, MediaFrame).
import { cn, each, ref, text, use, when, organism } from "../../build";
import type { OrganismSpec, Value, ViewNode } from "../../ir";
import { fields, spec } from "../kit";
import { id, title, tsOf } from "../props";
import { O, level, description, titleId, padding, align, teamDerived, section } from "./simple";
import { centered, list, head, itemTitle, itemText, ulist, is, chain } from "./simple-more";

const axis = (name: string, ...values: string[]) => ({ name, type: tsOf(...values), default: values[0] });
const CARD = "rounded border border-border bg-card p-6 text-card-foreground";
const listSection = (body: ViewNode) => section(use("Stack", { props: { Gap: "12", Align: "stretch" } }, head(), body));
const linkTo = (href: string, body: ViewNode) => when(ref(href), [use("LinkPlain", { props: { Href: ref(href), Class: "hover:text-primary" } }, body)], [body]);
const accent = (field: string, cls: Value) => use("Text", { props: { Size: "base", Weight: "semibold", Class: cn("text-primary", cls) } }, text(ref(field)));

// ---- ServicesSimple (services@1): the services of a studio or an agency: the name as a link, a line and the starting price
const servicesSimple = spec(`${O}services-simple`, "ServicesSimple", "The simple services (model services@1): the heading, a description and the services as a list, each with the name (a link when the service has an address), a line and the price as it is shown (from 90 000 per project). Text only. Axes: layout (cards: a card surface per service; rows: one row per service, the price at the end from md up), cols (3, 2 columns of the cards).", {
  records: { Service: fields(["id", "string"], ["title", "string"], ["description", "string", true], ["price", "string", true], ["href", "string", true]) },
  props: [id, title, description, list("items", "Service", "the services, in the order they are shown (1 to 9)"), level, padding, centered, axis("layout", "cards", "rows"), axis("cols", "3", "2")],
  derived: [
    titleId, ...teamDerived,
    chain("grid", [[is("layout", "rows"), "mx-auto max-w-3xl grid-cols-1 gap-4"], [is("cols", "2"), "grid-cols-1 gap-6 md:grid-cols-2"]], "grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"),
    chain("item", [[is("layout", "rows"), `${CARD} grid grid-cols-1 items-center gap-4 md:grid-cols-3`]], `${CARD} flex flex-col gap-4`),
    chain("copy", [[is("layout", "rows"), "md:col-span-2"]], "grow"),
    chain("cost", [[is("layout", "rows"), "text-start md:text-end"]], "text-start"),
  ],
  view: [listSection(
    ulist(cn("grid", ref("grid")),
      each(ref("items"), "s", ref("s.id"),
        use("ListItem", { props: { Class: ref("item") }, attrs: { "data-testid": "service" } },
          use("Stack", { props: { Gap: "2", Align: "start", Class: ref("copy") } },
            linkTo("s.href", itemTitle("s.title", "lg", "text-start")),
            itemText("s.description", "text-start")),
          when(ref("s.price"), [accent("s.price", ref("cost"))])))))],
});

// ---- CasesSimple (cases@1): case studies: a picture, the client, the title as a link and the result in one line
const casesSimple = spec(`${O}cases-simple`, "CasesSimple", "The simple case studies (model cases@1): the heading, a description and the cases as a list, each with a picture, the client (the primary token), the title (a link when the case has an address) and the result in one line. Axes: layout (cards: a card surface per case, the picture on top; rows: the picture at the start, a third of the row from md up), cols (3, 2 columns of the cards).", {
  records: { CaseStudy: fields(["id", "string"], ["image", "string", true], ["client", "string", true], ["title", "string"], ["result", "string", true], ["href", "string", true]) },
  props: [id, title, description, list("items", "CaseStudy", "the cases, in the order they are shown (1 to 6)"), level, padding, centered, axis("layout", "cards", "rows"), axis("cols", "3", "2")],
  derived: [
    titleId, ...teamDerived,
    chain("grid", [[is("layout", "rows"), "grid-cols-1 gap-8"], [is("cols", "2"), "grid-cols-1 gap-6 md:grid-cols-2"]], "grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"),
    chain("item", [[is("layout", "rows"), `${CARD} grid grid-cols-1 items-center gap-6 md:grid-cols-3`]], `${CARD} flex flex-col gap-4`),
    chain("copy", [[is("layout", "rows"), "md:col-span-2"]], "grow"),
  ],
  view: [listSection(
    ulist(cn("grid", ref("grid")),
      each(ref("items"), "c", ref("c.id"),
        use("ListItem", { props: { Class: ref("item") }, attrs: { "data-testid": "case" } },
          organism("MediaFrame", { alt: ref("c.title"), src: ref("c.image"), ratio: "16/9", className: "rounded" }),
          use("Stack", { props: { Gap: "2", Align: "start", Class: ref("copy") } },
            when(ref("c.client"), [accent("c.client", "text-start")]),
            linkTo("c.href", itemTitle("c.title", "lg", "text-start")),
            itemText("c.result", "text-start"))))))],
});

// ---- TimelineSimple (timeline@1): a process or a history: the date or the stage, the title and a line per step
const timelineSimple = spec(`${O}timeline-simple`, "TimelineSimple", "The simple timeline (model timeline@1): the heading, a description and the steps of a process or a history as an ordered list, each with the date or the stage (the primary token), a title and a line. Text only. Axes: layout (column: one narrow column, a muted line at the start of each step; grid: the steps side by side), cols (2, 4 columns of the grid from md up).", {
  records: { TimelineStep: fields(["id", "string"], ["date", "string"], ["title", "string"], ["text", "string", true]) },
  props: [id, title, description, list("items", "TimelineStep", "the steps, in their order (2 to 8)"), level, padding, align, axis("layout", "column", "grid"), axis("cols", "2", "4")],
  derived: [
    titleId, ...teamDerived,
    chain("grid", [[is("layout", "column"), "max-w-2xl grid-cols-1 gap-8"], [is("cols", "4"), "grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4"]], "grid-cols-1 gap-8 md:grid-cols-2"),
    chain("item", [[is("layout", "column"), "flex flex-col gap-2 rounded bg-muted p-6"]], "flex flex-col gap-2"),
  ],
  view: [listSection(
    use("List", { props: { Tag: "ol", Class: cn("m-0 grid w-full list-none p-0", ref("grid"), ref("selfAlign")) } },
      each(ref("items"), "t", ref("t.id"),
        use("ListItem", { props: { Class: cn(ref("item"), ref("itemsAlign")) }, attrs: { "data-testid": "timeline-step" } },
          accent("t.date", ref("textAlign")),
          itemTitle("t.title", "lg"),
          itemText("t.text")))))],
});

// ---- DigitalSimple (digital@1): digital goods (templates, e-books, courses): the format, the name as a link, a line and the price
const digitalSimple = spec(`${O}digital-simple`, "DigitalSimple", "The simple digital goods (model digital@1): the heading, a description and the goods as a list, each with the format as a pill (PDF, Figma, video course), the name (a link when the good has an address), a line and the price as it is shown. Text only. Axes: layout (cards: a card surface per good in three columns; rows: one row per good, the price at the end from md up).", {
  records: { DigitalGood: fields(["id", "string"], ["format", "string", true], ["title", "string"], ["description", "string", true], ["price", "string"], ["href", "string", true]) },
  props: [id, title, description, list("items", "DigitalGood", "the goods, in the order they are shown (1 to 9)"), level, padding, centered, axis("layout", "cards", "rows")],
  derived: [
    titleId, ...teamDerived,
    chain("grid", [[is("layout", "rows"), "mx-auto max-w-3xl grid-cols-1 gap-4"]], "grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"),
    chain("item", [[is("layout", "rows"), `${CARD} grid grid-cols-1 items-center gap-4 md:grid-cols-3`]], `${CARD} flex flex-col gap-4`),
    chain("copy", [[is("layout", "rows"), "md:col-span-2"]], "grow"),
    chain("cost", [[is("layout", "rows"), "text-start md:text-end"]], "text-start"),
  ],
  view: [listSection(
    ulist(cn("grid", ref("grid")),
      each(ref("items"), "g", ref("g.id"),
        use("ListItem", { props: { Class: ref("item") }, attrs: { "data-testid": "digital-good" } },
          use("Stack", { props: { Gap: "2", Align: "start", Class: ref("copy") } },
            when(ref("g.format"), [use("Badge", { props: { Variant: "outline" } }, text(ref("g.format")))]),
            linkTo("g.href", itemTitle("g.title", "lg", "text-start")),
            itemText("g.description", "text-start")),
          accent("g.price", ref("cost"))))))],
});

export const simpleBusinessOrganisms: OrganismSpec[] = [servicesSimple, casesSimple, timelineSimple, digitalSimple];
