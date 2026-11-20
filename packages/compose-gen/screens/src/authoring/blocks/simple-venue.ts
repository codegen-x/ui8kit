// The simple line, wave 3 (food, stays and local services; one content model each, specs/models): MenuSimple (menu@1), HoursSimple (hours@1), RoomsSimple (rooms@1).
// The rules of simple.ts: the props are the fields of the model plus the axes and the settings; only the compositions
// packages/prototypes lowers (Box, Block, Container, Stack, Group, List, ListItem, LinkPlain; Title, Text, Badge, LinkButton, MediaFrame).
import { and, cn, each, ref, text, use, when, organism } from "../../build";
import type { OrganismSpec, Value, ViewNode } from "../../ir";
import { fields, spec } from "../kit";
import { id, title, tsOf } from "../props";
import { O, level, description, titleId, padding, teamDerived, alignItems, textAlign, section } from "./simple";
import { centered, list, head, itemTitle, itemText, ulist, is, isAlignV, chain } from "./simple-more";

const str = (name: string, docs: string, required = false) => (required ? { name, type: "string" as const, required: true, docs } : { name, type: "string" as const, default: "", docs });
const axis = (name: string, ...values: string[]) => ({ name, type: tsOf(...values), default: values[0] });
const CARD = "rounded bg-card p-6 text-card-foreground border border-border";
const listSection = (body: ViewNode, narrow: Value = "") => section(use("Stack", { props: { Gap: "12", Align: "stretch", Class: narrow } }, head(), body));
const pill = (field: string) => when(ref(field), [use("Badge", { props: { Variant: "default" } }, text(ref(field)))]);
const linkTo = (href: string, body: ViewNode) => when(ref(href), [use("LinkPlain", { props: { Href: ref(href), Class: "hover:text-primary" } }, body)], [body]);
const muted = (field: string, cls: Value = "text-start") => use("Text", { props: { Size: "sm", Class: cn("text-muted-foreground", cls) } }, text(ref(field)));
const price = (field: string, cls: Value = "text-start") => use("Text", { props: { Size: "lg", Weight: "bold", Class: cn("tracking-tight", cls) } }, text(ref(field)));

// ---- MenuSimple (menu@1): dishes on cards (a picture, an optional badge, the name, the weight, a line, the price) or menu rows
const menuSimple = spec(`${O}menu-simple`, "MenuSimple", "The simple menu (model menu@1): the heading, a description and the dishes as a list, each with a picture, an optional badge (a new or a spicy dish), the name, the weight or the portion, a line and the price as it is shown. Axes: layout (cards: a card surface per dish, the picture on top; rows: the picture at the start, the price at the end), cols (3, 2, 4 columns of the cards).", {
  records: { MenuDish: fields(["id", "string"], ["image", "string", true], ["title", "string"], ["weight", "string", true], ["price", "string"], ["description", "string", true], ["badge", "string", true]) },
  props: [id, title, description, list("items", "MenuDish", "the dishes, in the order they are shown (1 to 8)"), level, padding, centered, axis("layout", "cards", "rows"), axis("cols", "3", "2", "4")],
  derived: [
    titleId, ...teamDerived,
    chain("grid", [[is("layout", "rows"), "mx-auto max-w-3xl grid-cols-1 gap-4"], [is("cols", "2"), "grid-cols-1 gap-6 md:grid-cols-2"], [is("cols", "4"), "grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"]], "grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3"),
    chain("item", [[is("layout", "rows"), "flex flex-row items-center gap-4"]], `${CARD} flex flex-col gap-4`),
    chain("pictureClass", [[is("layout", "rows"), "size-24 shrink-0 rounded"]], ""),
    chain("copy", [[is("layout", "rows"), "grow"]], "grow"),
    chain("cost", [[is("layout", "rows"), "shrink-0 text-end"]], "text-start"),
  ],
  view: [listSection(
    ulist(cn("grid", ref("grid")),
      each(ref("items"), "p", ref("p.id"),
        use("ListItem", { props: { Class: ref("item") }, attrs: { "data-testid": "dish" } },
          organism("MediaFrame", { alt: ref("p.title"), src: ref("p.image"), ratio: "4/3", className: ref("pictureClass") }),
          use("Stack", { props: { Gap: "2", Align: "start", Class: ref("copy") } },
            pill("p.badge"),
            itemTitle("p.title", "lg", "text-start"),
            when(ref("p.weight"), [muted("p.weight")]),
            itemText("p.description", "text-start")),
          price("p.price", ref("cost"))))))],
});

// ---- HoursSimple (hours@1): the address, the phone, a map link and the opening hours (a day and the time per row)
const hoursSimple = spec(`${O}hours-simple`, "HoursSimple", "The simple opening hours (model hours@1): the heading, a description, the address, the phone as a link, an optional map link and the opening hours as a list (the day or the days and the time per row). Axes: layout (columns: the address and the links at the start, the hours at the end from md up; stack: one narrow column, placed by the align setting), surface (plain, card: the address and the hours each on a card).", {
  records: { OpeningHour: fields(["id", "string"], ["day", "string"], ["time", "string"]) },
  props: [id, title, description, str("address", "the address as it is shown", true), str("phone", "the phone number as it is shown", true), str("phoneHref", "the address of the phone link (tel:)", true), str("mapLabel", "the label of the map link; the link is drawn when the label and the address are both set"), str("mapHref", "the address of the map"), list("items", "OpeningHour", "the opening hours, a row per day or per days (1 to 7)"), level, padding, centered, axis("layout", "columns", "stack"), axis("surface", "plain", "card")],
  derived: [
    titleId, ...teamDerived,
    chain("frame", [[and(is("layout", "stack"), isAlignV("center")), "flex w-full max-w-md flex-col gap-8 self-center"], [and(is("layout", "stack"), isAlignV("end")), "flex w-full max-w-md flex-col gap-8 self-end"], [is("layout", "stack"), "flex w-full max-w-md flex-col gap-8"]], "grid grid-cols-1 gap-8 md:grid-cols-2"),
    chain("panel", [[is("surface", "card"), CARD]], ""),
  ],
  view: [section(use("Stack", { props: { Gap: "12", Align: "stretch" } }, head(),
    use("Box", { props: { Class: ref("frame") } },
      use("Stack", { props: { Gap: "4", Align: alignItems, Class: ref("panel") } },
        use("Text", { props: { Size: "lg", Weight: "semibold", Class: textAlign } }, text(ref("address"))),
        use("LinkPlain", { props: { Href: ref("phoneHref"), Class: "hover:text-primary" } }, use("Text", { props: { Size: "lg", Class: textAlign } }, text(ref("phone")))),
        when(and(ref("mapLabel"), ref("mapHref")), [use("LinkPlain", { props: { Href: ref("mapHref"), Class: "hover:text-primary" } }, use("Text", { props: { Size: "sm", Class: cn("text-primary", textAlign) } }, text(ref("mapLabel"))))])),
      ulist(cn("grid grid-cols-1 gap-2", ref("panel")),
        each(ref("items"), "h", ref("h.id"),
          use("ListItem", { props: { Class: "flex flex-row justify-between gap-4" }, attrs: { "data-testid": "opening-hour" } },
            use("Text", { props: { Size: "base", Class: "text-muted-foreground" } }, text(ref("h.day"))),
            use("Text", { props: { Size: "base", Weight: "semibold" } }, text(ref("h.time")))))))))],
});

// ---- RoomsSimple (rooms@1): rooms or apartments on cards (a picture, the name as a link, the guests, a line, the price a night) or rows
const roomsSimple = spec(`${O}rooms-simple`, "RoomsSimple", "The simple rooms (model rooms@1): the heading, a description and the rooms as a list, each with a picture, the name (a link when the room has an address), the guests or the size, a line and the price a night as it is shown. Axes: layout (cards: a card surface per room, the picture on top; rows: the picture at the start, a third of the row from md up), cols (3, 2 columns of the cards).", {
  records: { Room: fields(["id", "string"], ["image", "string", true], ["title", "string"], ["guests", "string", true], ["price", "string"], ["description", "string", true], ["href", "string", true]) },
  props: [id, title, description, list("items", "Room", "the rooms, in the order they are shown (1 to 6)"), level, padding, centered, axis("layout", "cards", "rows"), axis("cols", "3", "2")],
  derived: [
    titleId, ...teamDerived,
    chain("grid", [[is("layout", "rows"), "grid-cols-1 gap-8"], [is("cols", "2"), "grid-cols-1 gap-6 md:grid-cols-2"]], "grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"),
    chain("item", [[is("layout", "rows"), `${CARD} grid grid-cols-1 items-center gap-6 md:grid-cols-3`]], `${CARD} flex flex-col gap-4`),
    chain("copy", [[is("layout", "rows"), "md:col-span-2"]], "grow"),
  ],
  view: [listSection(
    ulist(cn("grid", ref("grid")),
      each(ref("items"), "r", ref("r.id"),
        use("ListItem", { props: { Class: ref("item") }, attrs: { "data-testid": "room" } },
          organism("MediaFrame", { alt: ref("r.title"), src: ref("r.image"), ratio: "4/3", className: "rounded" }),
          use("Stack", { props: { Gap: "2", Align: "start", Class: ref("copy") } },
            linkTo("r.href", itemTitle("r.title", "lg", "text-start")),
            when(ref("r.guests"), [muted("r.guests")]),
            itemText("r.description", "text-start"),
            price("r.price"))))))],
});

export const simpleVenueOrganisms: OrganismSpec[] = [menuSimple, hoursSimple, roomsSimple];
