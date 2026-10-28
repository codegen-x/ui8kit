// The choices of the Theme sheet's skin and font pickers, data-driven from the shared lists (@ui8kit/taste-data), so a new skin or
// font shows up here and in the selects at once. `null` is the first choice: "Default" (the theme sets nothing; the site shows the
// app's own skin or font).
import { FONT_IDS } from "@ui8kit/taste-data/font-ids";
import { SKIN_IDS } from "@ui8kit/taste-data/taste";

export type PickerKind = "skins" | "fonts";
export const CHOICES: Record<PickerKind, readonly (string | null)[]> = { skins: [null, ...SKIN_IDS], fonts: [null, ...FONT_IDS] };
/** the theme field a picker writes (the same as the select it sits beside) */
export const PICKER_FIELD: Record<PickerKind, "skin" | "font"> = { skins: "skin", fonts: "font" };
/** the picker opened from a field's select, if any */
export const pickerOf = (field: string): PickerKind | null => (field === "skin" ? "skins" : field === "font" ? "fonts" : null);
/** the colour tokens a skin card shows as dots */
export const SWATCHES = ["primary", "secondary", "accent", "muted", "chart-1", "chart-2"] as const;
