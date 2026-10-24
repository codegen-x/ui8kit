// The renamed storage keys (xgen-theme -> codegen-x-theme): a choice saved under the old key is read once and moved to the new one.
import { afterAll, beforeEach, expect, test } from "bun:test";
import { initTheme, toggleTheme } from "../assets/app/theme";

const store = new Map<string, string>();
const fakeStorage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, String(v)), removeItem: (k: string) => void store.delete(k) };
const root = { dataset: {} as Record<string, string>, style: {} as Record<string, string>, classList: { toggle: () => {} } };
const g = globalThis as Record<string, unknown>;
const before = { localStorage: g.localStorage, document: g.document };
Object.assign(g, { localStorage: fakeStorage, document: { documentElement: root } });
afterAll(() => { for (const [k, v] of Object.entries(before)) if (v === undefined) delete g[k]; else g[k] = v; });
beforeEach(() => { store.clear(); root.dataset = {}; });

test("a theme saved under xgen-theme is applied and moved to codegen-x-theme", () => {
  store.set("xgen-theme", "light");
  initTheme("dark");
  expect(root.dataset.theme).toBe("light");
  expect([...store.entries()]).toEqual([["codegen-x-theme", "light"]]);
});

test("the new key wins over a leftover old one; nothing saved keeps the default; a toggle writes the new key", () => {
  store.set("xgen-theme", "light"); store.set("codegen-x-theme", "dark");
  initTheme("light");
  expect(root.dataset.theme).toBe("dark");
  store.clear(); initTheme("dark");
  expect(root.dataset.theme).toBe("dark");
  toggleTheme();
  expect(store.get("codegen-x-theme")).toBe("light");
  expect(store.has("xgen-theme")).toBe(false);
});
