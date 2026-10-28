import { expect, test } from "bun:test";
import { FONT_IDS } from "@ui8kit/taste-data/font-ids";
import { SKIN_IDS } from "@ui8kit/taste-data/taste";
import { CHOICES, PICKER_FIELD, pickerOf } from "./pickers";

test("the pickers list Default and every skin and font of the shared lists", () => {
  expect(CHOICES.skins).toEqual([null, ...SKIN_IDS]);
  expect(CHOICES.fonts).toEqual([null, ...FONT_IDS]);
});
test("a picker writes the field of the select it opens from", () => {
  expect(pickerOf("skin")).toBe("skins");
  expect(pickerOf("font")).toBe("fonts");
  expect(pickerOf("radius")).toBeNull();
  expect(PICKER_FIELD[pickerOf("skin")!]).toBe("skin");
  expect(PICKER_FIELD[pickerOf("font")!]).toBe("font");
});
