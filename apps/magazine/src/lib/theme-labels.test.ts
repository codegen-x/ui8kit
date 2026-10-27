// The Magazine's labels for the theme model (@ui8kit/theme-model): both views (the Theme panel and the Design system panel) have a
// label for every field in content/ui.json. The model's own tests live with the package.
import { describe, expect, test } from "bun:test";
import { FIELD_IDS, viewFields } from "@ui8kit/theme-model/global-theme";
import ui from "../../content/ui.json";

describe("theme labels", () => {
  test("both views (Theme panel and Design system panel) render every field, with a label for each", () => {
    for (const view of ["sheet", "design"] as const) {
      const v = viewFields(view);
      expect(v.map((r) => r.field.id)).toEqual([...FIELD_IDS]);
      for (const r of v) {
        expect(["radio", "select"]).toContain(r.control);
        const label = r.field.group === "site" ? (ui.theme as Record<string, unknown>)[r.field.id] : (ui.design.elements as Record<string, string>)[r.field.element!];
        expect(typeof label).toBe("string");
      }
    }
  });
});
