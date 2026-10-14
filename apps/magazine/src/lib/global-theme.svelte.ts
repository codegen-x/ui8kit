// The global theme as shared state (lib/global-theme.ts): loaded once from this device, saved on every change; the Theme sheet's
// open state (narrow panel) and whether its wide Design system panel is shown.
import { readTheme, writeTheme, type GlobalTheme } from "./global-theme";

export const gtheme = $state<{ value: GlobalTheme; open: boolean; wide: boolean }>({ value: readTheme(), open: false, wide: false });

export function setTheme(patch: Partial<GlobalTheme>): void {
  gtheme.value = { ...gtheme.value, ...patch };
  writeTheme(gtheme.value);
}
