// A table reservation form: name, phone and/or email, date, time, guests, optional notes and consent. Distinct from ContactForm
// (subject and message): this form is a booking. No new Codex kind; labels from the dictionary; split details map from kind `contact` (Feature).
import { and, cond, each, eq, gt, len, ref, text, use, when, organism } from "../../build";
import type { OrganismSpec } from "../../ir";
import { fields, spec, ts } from "../kit";
import { frame } from "../components/frames";
import { id, title, tsOf, denseLite } from "../props";
import { checkRow, fid, inputField, textField } from "../forms";

const O = "organism.";

const details = () => when(and(eq(ref("layout"), "split"), gt(len(ref("details")), 0)), [use("Stack", { props: { Gap: "4" }, attrs: { "data-testid": "details" } },
  each(ref("details"), "d", ref("d.id"),
    use("Group", { props: { Gap: "4", Align: "start" }, attrs: { "data-testid": "detail" } },
      use("LucideIcon", { props: { Name: ref("d.icon"), Size: 20 } }),
      use("Stack", { props: { Gap: "0" } },
        use("Text", { props: { Size: "base", Weight: "semibold" } }, text(ref("d.title"))),
        use("Text", { props: { Size: "sm", Class: "text-muted-foreground" } }, text(ref("d.text")))))))]);

const form = () => use("Form", { props: { Method: "dialog", Class: "flex w-full flex-col gap-4" }, attrs: { "data-testid": "reservation-form" } },
  inputField("name", "text", ref("labels.name"), "name"),
  inputField("phone", "tel", ref("labels.phone"), "tel"),
  when(eq(ref("fields"), "full"), [inputField("email", "email", ref("labels.email"), "email")]),
  use("Group", { props: { Gap: "4", Class: "flex-wrap" } },
    use("Box", { props: { Class: "min-w-0 flex-1" } }, inputField("date", "date", ref("labels.date"))),
    use("Box", { props: { Class: "min-w-0 flex-1" } }, inputField("time", "time", ref("labels.time")))),
  use("Stack", { props: { Gap: "2" } },
    use("Label", { props: { Class: "text-xs font-bold text-foreground" } }, text(ref("labels.guests"))),
    organism("NumberField", { value: "2", name: fid("guests"), min: "1", label: ref("labels.guests"), decrease: ref("labels.decrease"), increase: ref("labels.increase") })),
  when(eq(ref("fields"), "full"), [textField("notes", ref("labels.notes"))]),
  when(eq(ref("terms"), "show"), [checkRow("consent", ref("labels.consent"))]),
  use("Button", { props: { Variant: "default", Size: "default", Type: "submit", Class: "w-fit" }, attrs: { "data-testid": "submit" } }, text(ref("labels.submit"))));

const reservationForm = spec(`${O}reservation-form`, "ReservationForm", "A table reservation: name, phone and/or email, date, time, guests, optional notes and consent; in the split layout, the ways to reach the house sit beside the form. Axes: layout (single, split), density, fields (full, compact).", {
  records: { ReservationLabels: fields(["name", "string"], ["phone", "string"], ["email", "string"], ["date", "string"], ["time", "string"], ["guests", "string"], ["notes", "string"], ["consent", "string"], ["submit", "string"], ["decrease", "string"], ["increase", "string"]) },
  typeImports: [{ from: "FeatureGrid", names: ["Feature"] }],
  props: [
    id, title,
    { name: "text", type: "string", required: true },
    { name: "labels", type: { record: "ReservationLabels" }, required: true },
    { name: "details", type: ts("Feature[]"), required: true, docs: "address, hours and phone, shown beside the form in the split layout; Codex kind `contact`" },
    { name: "layout", type: tsOf("single", "split"), default: "single" },
    { name: "fields", type: tsOf("full", "compact"), default: "full" },
    { name: "terms", type: tsOf("show", "hide"), default: "hide" },
    { name: "density", type: denseLite, default: "default" },
  ],
  view: [frame({ id: ref("id"), title: ref("title"), lead: ref("text"), density: ref("density"), measure: cond(eq(ref("layout"), "single"), "xl", "default") }, [
    use("Grid", { props: { Cols: cond(eq(ref("layout"), "split"), "1-2", "1"), Class: "items-start gap-8" } },
      form(),
      details()),
  ])],
});

export const reservationFormOrganisms: OrganismSpec[] = [reservationForm];
