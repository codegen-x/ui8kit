/**
 * WCAG AA for the destructive fill: text-destructive-foreground on bg-destructive must reach 4.5:1 in the theme and every
 * skin, light and dark (theme.css + 17 skin files x 2 = 36 combinations). Skins inherit what they do not set from theme.css.
 */
import { describe, expect, it } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const STYLES = join(import.meta.dir, "..", "..", "..", "xgen", "runtimes", "core", "assets", "styles");

type Vars = Record<string, string>;
function blocks(css: string): { light: Vars; dark: Vars } {
  const out = { light: {} as Vars, dark: {} as Vars };
  for (const [, sel, body] of css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const vars = Object.fromEntries([...body!.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1]!, m[2]!.trim()]));
    Object.assign(sel!.includes("dark") ? out.dark : out.light, vars);
  }
  return out;
}
function hsl(v: string): [number, number, number] {
  const m = /^hsl\(([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\)$/.exec(v);
  if (!m) throw new Error(`not an opaque hsl(): ${v}`);
  const [h, s, l] = [Number(m[1]) / 360, Number(m[2]) / 100, Number(m[3]) / 100];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const ch = (t: number) => {
    t = (t + 1) % 1;
    return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p;
  };
  return [ch(h + 1 / 3), ch(h), ch(h - 1 / 3)];
}
const lum = (c: number[]) =>
  c.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i]!, 0);
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(hsl(a)), lum(hsl(b))].sort((m, n) => n - m);
  return (x! + 0.05) / (y! + 0.05);
};

const base = blocks(readFileSync(join(STYLES, "theme.css"), "utf8"));
const files = ["theme.css", ...readdirSync(join(STYLES, "skins")).filter((f) => f.endsWith(".css")).sort().map((f) => `skins/${f}`)];

describe("destructive contrast (AA 4.5)", () => {
  it("covers 36 combinations", () => expect(files.length * 2).toBe(36));
  for (const f of files) {
    const own = blocks(readFileSync(join(STYLES, f), "utf8"));
    for (const mode of ["light", "dark"] as const) {
      it(`${f} ${mode}`, () => {
        const v = { ...base[mode], ...own[mode] };
        expect(v["destructive-foreground"], "--destructive-foreground").toBeDefined();
        expect(ratio(v["destructive-foreground"]!, v["destructive"]!)).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});

describe("destructive recipes", () => {
  for (const f of readdirSync(join(import.meta.dir, "..", "variants"))) {
    it(f, () => {
      for (const m of readFileSync(join(import.meta.dir, "..", "variants", f), "utf8").matchAll(/"destructive":\s*"([^"]*)"/g)) {
        if (!m[1]!.includes("bg-destructive")) continue;
        expect(m[1]).toContain("text-destructive-foreground");
        expect(m[1]).not.toMatch(/dark:bg-destructive\/|text-primary-foreground/);
      }
    });
  }
});
