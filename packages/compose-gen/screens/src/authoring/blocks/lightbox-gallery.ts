// A photo gallery with a lightbox dialog for the selected picture. Additive to PhotoGallery (static grid/masonry/featured, no dialog).
// Open state is a prop (static markup). Photos map from Codex kind `photo` (PhotoGallery.Photo). Pictures are MediaFrame placeholders.
import { and, cn, cond, eachAt, eq, firstOf, len, or, ref, text, tpl, use, when, organism } from "../../build";
import type { OrganismSpec, Value } from "../../ir";
import { fields, spec, ts } from "../kit";
import { frame } from "../components/frames";
import { empty, id, orEmpty, title, tsOf } from "../props";
import { muted, strong } from "../ux";
import { figureBlockOf } from "../components/landmarks";

const O = "organism.";
const lead = { name: "lead", type: "string" as const, default: "" };
const ratioOf = (size: Value): Value => cond(eq(size, "tall"), "3/4", cond(eq(size, "wide"), "16/9", cond(eq(size, "large"), "4/3", "1/1")));

const thumbs = () => use("Box", { props: { Class: "grid grid-cols-3 gap-2 sm:grid-cols-9" }, attrs: { "data-testid": "thumbs" } },
  eachAt(ref("photos"), "p", "i", ref("p.id"),
    organism("MediaFrame", { alt: ref("p.title"), ratio: "1/1", className: cond(eq(ref("i"), 0), "ring-2 ring-foreground", "") })));

const featured = () => use("Stack", { props: { Gap: "4", Align: "stretch" }, attrs: { "data-testid": "featured" } },
  organism("MediaFrame", { alt: ref("title"), ratio: "16/9" }),
  use("Group", { props: { Gap: "4", Align: "center", Justify: "between" } },
    use("Stack", { props: { Gap: "0" } }, strong(firstOf(ref("photos"), "title")), muted(tpl(ref("labels.counter"), 1, len(ref("photos"))), "xs")),
    use("Group", { props: { Gap: "2" } },
      use("Button", { props: { Variant: "outline", Size: "sm", Layout: "icon", Type: "button", AriaLabel: ref("labels.previous") } }, use("LucideIcon", { props: { Name: "chevron-left", Size: 16 } })),
      use("Button", { props: { Variant: "outline", Size: "sm", Layout: "icon", Type: "button", AriaLabel: ref("labels.next") } }, use("LucideIcon", { props: { Name: "chevron-right", Size: 16 } })))),
  thumbs());

const tile = () => figureBlockOf(cn("relative flex flex-col gap-2", cond(eq(ref("layout"), "masonry"), "mb-4 break-inside-avoid", "")), "item",
  organism("MediaFrame", { alt: ref("p.title"), ratio: cond(eq(ref("layout"), "masonry"), ratioOf(ref("p.size")), "4/3") }),
  use("Button", { props: { Variant: "ghost", Size: "sm", Layout: "icon", Type: "button", Class: "absolute right-2 top-2 bg-background", AriaLabel: ref("labels.open") }, attrs: { "data-testid": "open" } }, use("LucideIcon", { props: { Name: "arrow-up-right", Size: 16 } })),
  when(and(eq(ref("captions"), "show"), or(eq(ref("layout"), "grid"), eq(ref("layout"), "masonry"))), [use("Box", { props: { Class: "text-sm text-muted-foreground" }, attrs: { "data-testid": "caption" } }, text(ref("p.title")))]));

const grid = () => use("Box", { props: { Class: cond(eq(ref("layout"), "masonry"), "columns-1 gap-4 sm:columns-2 lg:columns-3", "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3") }, attrs: { "data-testid": "items" } },
  eachAt(ref("photos"), "p", "i", ref("p.id"), tile()));

const navButtons = () => use("Group", { props: { Gap: "2" } },
  use("Button", { props: { Variant: "outline", Size: "sm", Layout: "icon", Type: "button", AriaLabel: ref("labels.previous") } }, use("LucideIcon", { props: { Name: "chevron-left", Size: 16 } })),
  use("Button", { props: { Variant: "outline", Size: "sm", Layout: "icon", Type: "button", AriaLabel: ref("labels.next") } }, use("LucideIcon", { props: { Name: "chevron-right", Size: 16 } })));

const lightbox = () => use("Dialog", { props: { Open: eq(ref("lightbox"), "open"), Size: "xl", AriaLabel: firstOf(ref("photos"), "title"), Class: "gap-4 p-4" }, attrs: { "data-testid": "lightbox" } },
  use("Group", { props: { Gap: "2", Align: "center", Justify: "between" } },
    strong(firstOf(ref("photos"), "title"), "sm"),
    use("Button", { props: { Variant: "ghost", Size: "sm", Layout: "icon", Type: "button", AriaLabel: ref("labels.close") }, attrs: { "data-testid": "lightbox-close" } }, use("LucideIcon", { props: { Name: "x", Size: 16 } }))),
  organism("MediaFrame", { alt: firstOf(ref("photos"), "title"), ratio: "4/3" }),
  when(eq(ref("captions"), "show"), [muted(firstOf(ref("photos"), "tag"))]),
  use("Group", { props: { Gap: "2", Align: "center", Justify: "between" } },
    muted(tpl(ref("labels.counter"), 1, len(ref("photos"))), "xs"),
    navButtons()));

const lightboxStage = spec("pattern.lightbox-stage", "LightboxStage", "The selected photo in a dialog: title, close, picture, optional caption and previous/next. Static open state. Used by LightboxGallery.", {
  typeImports: [{ from: "LightboxGallery", names: ["LightboxLabels"] }, { from: "PhotoGallery", names: ["Photo"] }],
  props: [
    { name: "photos", type: ts("Photo[]"), required: true },
    { name: "labels", type: ts("LightboxLabels"), required: true },
    { name: "captions", type: tsOf("show", "hide"), default: "show" },
    { name: "lightbox", type: tsOf("open", "closed"), default: "closed" },
  ],
  view: [lightbox()],
});

const lightboxGallery = spec(`${O}lightbox-gallery`, "LightboxGallery", "Photos in a grid, a masonry of mixed heights, or a featured picture over thumbnails, with a dialog that shows the selected photo. Static markup: the dialog open state is a prop. Axes: layout (grid, masonry, featured), captions (show, hide), lightbox (open, closed).", {
  typeImports: [{ from: "PhotoGallery", names: ["Photo"] }],
  records: { LightboxLabels: fields(["close", "string"], ["previous", "string"], ["next", "string"], ["open", "string"], ["counter", "string"]) },
  props: [
    id, title, lead,
    { name: "photos", type: ts("Photo[]"), required: true },
    empty,
    { name: "labels", type: { record: "LightboxLabels" }, required: true },
    { name: "layout", type: tsOf("grid", "masonry", "featured"), default: "grid" },
    { name: "captions", type: tsOf("show", "hide"), default: "show" },
    { name: "lightbox", type: tsOf("open", "closed"), default: "closed" },
  ],
  view: [frame({ id: ref("id"), title: ref("title"), lead: ref("lead") }, [orEmpty("photos", "image", [
    when(eq(ref("layout"), "featured"), [featured()], [grid()]),
    organism("LightboxStage", { photos: ref("photos"), labels: ref("labels"), captions: ref("captions"), lightbox: ref("lightbox") }),
  ])])],
});

export const lightboxGalleryOrganisms: OrganismSpec[] = [lightboxStage, lightboxGallery];
