// The simple line, wave 3 (food, stays and local services; one content model each, specs/models): MenuSimple (menu@1), HoursSimple (hours@1), RoomsSimple (rooms@1), AmenitiesSimple (amenities@1), DeliverySimple (delivery@1).
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

// ---- HoursSimple (hours@1): the address (a link to the map), the phone and the opening hours (a day and the time per row)
const hoursSimple = spec(`${O}hours-simple`, "HoursSimple", "The simple opening hours (model hours@1): the heading, a description, the address, the phone as a link, the address as a link to the map when it has one, and the opening hours as a list (the day or the days and the time per row). Axes: layout (columns: the address and the links at the start, the hours at the end from md up; stack: one narrow column, placed by the align setting), surface (plain, card: the address and the hours each on a card).", {
  records: { OpeningHour: fields(["id", "string"], ["day", "string"], ["time", "string"]) },
  props: [id, title, description, str("address", "the address as it is shown", true), str("phone", "the phone number as it is shown", true), str("phoneHref", "the address of the phone link (tel:)", true), str("mapHref", "the address of the map; set: the address is a link to it"), list("items", "OpeningHour", "the opening hours, a row per day or per days (1 to 7)"), level, padding, centered, axis("layout", "columns", "stack"), axis("surface", "plain", "card")],
  derived: [
    titleId, ...teamDerived,
    chain("frame", [[is("layout", "stack"), "flex w-full max-w-md flex-col gap-8"]], "grid w-full grid-cols-1 gap-8 md:grid-cols-2"),
    chain("panel", [[is("surface", "card"), CARD]], ""),
  ],
  view: [section(use("Stack", { props: { Gap: "12", Align: "stretch" } }, head(),
    use("Box", { props: { Class: cn(ref("frame"), ref("selfAlign")) } },
      use("Stack", { props: { Gap: "4", Align: alignItems, Class: ref("panel") } },
        linkTo("mapHref", use("Text", { props: { Size: "lg", Weight: "semibold", Class: textAlign } }, text(ref("address")))),
        use("LinkPlain", { props: { Href: ref("phoneHref"), Class: "hover:text-primary" } }, use("Text", { props: { Size: "lg", Class: textAlign } }, text(ref("phone"))))),
      use("Box", { props: { Class: ref("panel") } }, ulist("grid grid-cols-1 gap-2",
        each(ref("items"), "h", ref("h.id"),
          use("ListItem", { props: { Class: "flex flex-row justify-between gap-4" }, attrs: { "data-testid": "opening-hour" } },
            use("Text", { props: { Size: "base", Class: "text-muted-foreground" } }, text(ref("h.day"))),
            use("Text", { props: { Size: "base", Weight: "semibold" } }, text(ref("h.time"))))))))))],
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

// ---- AmenitiesSimple (amenities@1): what a stay or a venue offers (Wi-Fi, parking, breakfast) as a short list: rows in columns or pills
const amenitiesSimple = spec(`${O}amenities-simple`, "AmenitiesSimple", "The simple amenities (model amenities@1): the heading, a description and the amenities as a list of short names. Text only. Axes: layout (grid: muted rows in columns; pills: outlined pills in a wrapping row, placed by the align setting), cols (3, 2 columns of the grid from md up).", {
  records: { Amenity: fields(["id", "string"], ["title", "string"]) },
  props: [id, title, description, list("items", "Amenity", "the amenities, in the order they are shown (2 to 16)"), level, padding, centered, axis("layout", "grid", "pills"), axis("cols", "3", "2")],
  derived: [
    titleId, ...teamDerived,
    chain("grid", [[and(is("layout", "pills"), isAlignV("center")), "flex flex-wrap justify-center gap-2"], [and(is("layout", "pills"), isAlignV("end")), "flex flex-wrap justify-end gap-2"], [is("layout", "pills"), "flex flex-wrap gap-2"], [is("cols", "2"), "grid grid-cols-1 gap-4 sm:grid-cols-2"]], "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"),
    chain("item", [[is("layout", "pills"), "rounded border border-border px-4 py-2"]], "rounded bg-muted px-4 py-4"),
  ],
  view: [listSection(
    ulist(ref("grid"),
      each(ref("items"), "a", ref("a.id"),
        use("ListItem", { props: { Class: ref("item") }, attrs: { "data-testid": "amenity" } },
          use("Text", { props: { Size: "base", Weight: "medium", Class: "text-start" } }, text(ref("a.title")))))))],
});

// ---- DeliverySimple (delivery@1): delivery zones: the area, the time, the price and the minimum order per zone
const deliverySimple = spec(`${O}delivery-simple`, "DeliverySimple", "The simple delivery zones (model delivery@1): the heading, a description and the zones as a list, each with the area, the delivery time, the price and the minimum order as they are shown. Text only. Axes: layout (rows: one card row per zone, the price at the end from md up; cards: a card per zone in three columns).", {
  records: { DeliveryZone: fields(["id", "string"], ["title", "string"], ["time", "string", true], ["price", "string"], ["minimum", "string", true]) },
  props: [id, title, description, list("items", "DeliveryZone", "the zones, nearest first (1 to 6)"), level, padding, centered, axis("layout", "rows", "cards")],
  derived: [
    titleId, ...teamDerived,
    chain("grid", [[is("layout", "cards"), "grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"]], "mx-auto max-w-3xl grid-cols-1 gap-4"),
    chain("item", [[is("layout", "cards"), `${CARD} flex flex-col gap-2`]], `${CARD} grid grid-cols-1 items-center gap-2 md:grid-cols-3`),
    chain("cost", [[is("layout", "cards"), "text-start"]], "text-start md:text-end"),
  ],
  view: [listSection(
    ulist(cn("grid", ref("grid")),
      each(ref("items"), "z", ref("z.id"),
        use("ListItem", { props: { Class: ref("item") }, attrs: { "data-testid": "delivery-zone" } },
          use("Stack", { props: { Gap: "2", Align: "start" } },
            itemTitle("z.title", "base", "text-start"),
            when(ref("z.time"), [muted("z.time")])),
          when(ref("z.minimum"), [muted("z.minimum")]),
          price("z.price", ref("cost"))))))],
});

export const simpleVenueOrganisms: OrganismSpec[] = [menuSimple, hoursSimple, roomsSimple, amenitiesSimple, deliverySimple];
