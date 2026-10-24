// The one description of codegen-x compositions: every former xgen brick (+ part) onto one of the 19 UI8Kit 3 primitives. Visual classes come from ../variants/<recipe>.variants.json
// (token-only recipes owned by codegen-x); the primitive renders the element and the ARIA. See docs/brick-map.md.

export type Primitive =
  | "Box" | "Text" | "Button" | "Link" | "Label" | "Form" | "Input" | "Textarea" | "Select" | "SelectOption" | "SelectOptGroup"
  | "Checkbox" | "Radio" | "Switch" | "Image" | "Icon" | "Dialog" | "Disclosure" | "Summary" | "Meter" | "Progress" | "Separator";

export type BrickMap = {
  /** v3 primitive that renders the node */
  primitive: Primitive;
  /** recipe id (file ../variants/<recipe>.variants.json); cva props of the brick select its classes */
  recipe?: string;
  /** fixed tag of the primitive (Box/Text `tag`) */
  tag?: string;
  /** brick prop that becomes the tag (Block.Tag, Text.Tag) or the heading level (Title.As -> h1..h6) */
  tagFrom?: { prop: string; heading?: boolean; fallback: string };
  /** fixed props/attrs on the primitive (e.g. Range -> Input type=range) */
  fixed?: Record<string, string>;
  /** classes added after the recipe (composition the v3 primitive no longer ships) */
  extra?: string;
  /** required props of the primitive that a Vue composition declares and forwards (Vue checks them on the component) */
  required?: string[];
  /** native attributes of the fixed element the Box/Text primitive types do not list (td scope, colspan): typed on the composition, forwarded as rest */
  attrs?: Record<string, "string" | "number">;
  /** an empty element rendered after the children (composition the v3 primitive no longer ships: the Summary open/close indicator) */
  trail?: { tag: string; attrs: Record<string, string> };
};

/** the open/close indicator of a disclosure summary, as in UI8Kit 2: a Lucide chevron through CSS, turned over by group-open */
export const SUMMARY_INDICATOR = { tag: "span", attrs: { class: "size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180", "aria-hidden": "true", "data-slot": "summary-indicator" } };

export const BRICKS: Record<string, BrickMap> = {
  Box: { primitive: "Box", recipe: "box", tagFrom: { prop: "Tag", fallback: "div" } },
  Block: { primitive: "Box", recipe: "block", tagFrom: { prop: "Tag", fallback: "div" } },
  Stack: { primitive: "Box", recipe: "stack", tagFrom: { prop: "Tag", fallback: "div" } },
  Group: { primitive: "Box", recipe: "group", tagFrom: { prop: "Tag", fallback: "div" } },
  Grid: { primitive: "Box", recipe: "grid", tagFrom: { prop: "Tag", fallback: "div" } },
  GridCol: { primitive: "Box", tag: "div" },
  Container: { primitive: "Box", recipe: "container", tagFrom: { prop: "Tag", fallback: "div" } },
  Inline: { primitive: "Text", recipe: "inline", tag: "span" },
  List: { primitive: "Box", recipe: "list", tagFrom: { prop: "Tag", fallback: "ul" } },
  ListItem: { primitive: "Box", tag: "li" },
  Skeleton: { primitive: "Box", recipe: "skeleton", tag: "div", fixed: { "aria-hidden": "true" } },
  Alert: { primitive: "Box", recipe: "alert", tag: "div", fixed: { role: "alert" } },
  Card: { primitive: "Box", recipe: "card", tag: "div" },
  // the Card parts carry no padding: the Card recipe pads the card (p-6), as the v2 bricks did (no double padding)
  CardHeader: { primitive: "Box", tag: "div", extra: "grid auto-rows-min items-start gap-2" },
  CardTitle: { primitive: "Text", tagFrom: { prop: "As", heading: true, fallback: "h3" }, extra: "font-semibold leading-none" },
  CardDescription: { primitive: "Text", tag: "p", extra: "text-sm text-muted-foreground" },
  CardContent: { primitive: "Box", tag: "div" },
  CardFooter: { primitive: "Box", tag: "div", extra: "flex items-center" },
  Table: { primitive: "Box", recipe: "table", tag: "table" },
  TableCaption: { primitive: "Box", tag: "caption" },
  TableHead: { primitive: "Box", tag: "thead" },
  TableBody: { primitive: "Box", tag: "tbody" },
  TableFoot: { primitive: "Box", tag: "tfoot" },
  TableRow: { primitive: "Box", tag: "tr" },
  TableHeadCell: { primitive: "Box", recipe: "table-head-cell", tag: "th", attrs: { scope: "string", colSpan: "number", rowSpan: "number", headers: "string", abbr: "string" } },
  TableCell: { primitive: "Box", recipe: "table-cell", tag: "td", attrs: { scope: "string", colSpan: "number", rowSpan: "number", headers: "string", abbr: "string" } },
  TableColGroup: { primitive: "Box", tag: "colgroup" },
  TableCol: { primitive: "Box", tag: "col" },
  Fieldset: { primitive: "Box", recipe: "fieldset", tag: "fieldset" },
  Legend: { primitive: "Text", recipe: "legend", tag: "legend" },
  FormItem: { primitive: "Box", recipe: "form-item", tag: "div" },
  FormDescription: { primitive: "Text", recipe: "form-description", tag: "p" },
  FormMessage: { primitive: "Text", recipe: "form-message", tag: "p" },
  Text: { primitive: "Text", recipe: "text", tagFrom: { prop: "Tag", fallback: "p" } },
  Title: { primitive: "Text", recipe: "title", tagFrom: { prop: "As", heading: true, fallback: "h2" } },
  Badge: { primitive: "Text", recipe: "badge", tag: "span" },
  IconBadge: { primitive: "Text", recipe: "iconbadge", tag: "span" },
  LucideIcon: { primitive: "Icon", recipe: "lucide-icon" },
  Icon: { primitive: "Icon", recipe: "icon" },
  Button: { primitive: "Button", recipe: "button" },
  ButtonPlain: { primitive: "Button", recipe: "button-plain" },
  Link: { primitive: "Link", recipe: "link" },
  LinkPlain: { primitive: "Link", recipe: "link-plain" },
  Label: { primitive: "Label", recipe: "label" },
  Form: { primitive: "Form", recipe: "form" },
  Input: { primitive: "Input", recipe: "input" },
  Range: { primitive: "Input", recipe: "range", fixed: { type: "range" } },
  Textarea: { primitive: "Textarea", recipe: "textarea" },
  Select: { primitive: "Select", recipe: "select" },
  SelectOption: { primitive: "SelectOption" },
  OptGroup: { primitive: "SelectOptGroup" },
  Checkbox: { primitive: "Checkbox", recipe: "checkbox" },
  Radio: { primitive: "Radio", recipe: "radio" },
  Switch: { primitive: "Switch", recipe: "switch" },
  Image: { primitive: "Image", recipe: "image", required: ["alt"] },
  Separator: { primitive: "Separator", recipe: "separator" },
  Dialog: { primitive: "Dialog", recipe: "dialog" },
  Sheet: { primitive: "Dialog", recipe: "sheet" },
  Disclosure: { primitive: "Disclosure", recipe: "disclosure" },
  Summary: { primitive: "Summary", recipe: "summary", trail: SUMMARY_INDICATOR },
  Meter: { primitive: "Meter", recipe: "meter" },
  Progress: { primitive: "Progress", recipe: "progress" },
};

/** Bricks with no single v3 primitive: hand-written compositions, not built yet (see docs/ui8kit3-brick-map.md). */
/** hand-written in src/manual.ts: Breadcrumb, ThemeToggle, SheetTrigger, SheetClose */
export const COMPOSED = ["Break", "DataList", "DataOption", "Output", "Picture", "Source"] as const;

/** Owner policy 8 + 4: the 4px step (odd Tailwind steps 1, 3, 5, ...) is allowed only inside controls; everywhere else the 8px grid. */
export const CONTROL_RECIPES = ["button", "button-plain", "badge", "iconbadge", "input", "range", "textarea", "select", "checkbox", "radio", "switch", "link-plain", "lucide-icon", "icon"] as const;
