// bun run included [--journal <path>] [--dry]
// Reads the Discovery inbox journal (discovery-inbox/journal.jsonl at the repo root, never committed), takes the entries with
// mode "include" and their card descriptors, merges them into src/included.json (deduped by full style: screen + skin +
// fonts + radius; committed, so the catalog outlives the journal) and regenerates plan/included-styles.md from it.
// Everything in the markdown is derived: layout and recipe from the screen, tokens from the skin css, taste from numbers.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { IncludedStyle } from "../src/included";
import { COMPOSITION_OF } from "../src/compositions";
import { TASTES } from "../src/tastes";

const APP = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = resolve(APP, "../..");
const args = process.argv.slice(2);
const argOf = (f: string) => (args.includes(f) ? args[args.indexOf(f) + 1] : undefined);
const JOURNAL = argOf("--journal") ?? join(ROOT, "discovery-inbox/journal.jsonl");
const JSON_PATH = join(APP, "src/included.json");
const MD_PATH = join(ROOT, "plan/included-styles.md");
const SKINS = join(ROOT, "packages/shared/app/src/styles/skins");

// ---------- 1. journal -> included.json ----------
type Card = { id: string; skin: string; font: string; radius: number; row: number; col: number };
const styles: IncludedStyle[] = JSON.parse(readFileSync(JSON_PATH, "utf8"));
const byKey = new Map(styles.map((s) => [s.key, s]));
let added = 0;
if (existsSync(JOURNAL)) {
  for (const line of readFileSync(JOURNAL, "utf8").split("\n")) {
    if (!line.trim()) continue;
    let e: { time?: string; mode?: string; cards?: Card[] };
    try { e = JSON.parse(line); } catch { continue; }
    if (e.mode !== "include" || !Array.isArray(e.cards)) continue;
    for (const c of e.cards) {
      const [display, body] = c.font.split("+") as [string, string];
      const key = `${c.id}|${c.skin}|${display}+${body}|${c.radius}`;
      let s = byKey.get(key);
      if (!s) {
        s = { key, id: c.id, skin: c.skin, fonts: { display, body }, radius: c.radius, firstSeen: e.time ?? "", sightings: [] };
        byKey.set(key, s); styles.push(s); added++;
      }
      if (!s.sightings.some((x) => x.time === e.time && x.row === c.row && x.col === c.col)) s.sightings.push({ time: e.time ?? "", row: c.row, col: c.col });
    }
  }
}
styles.sort((a, b) => a.firstSeen.localeCompare(b.firstSeen) || a.key.localeCompare(b.key));
if (!args.includes("--dry")) writeFileSync(JSON_PATH, JSON.stringify(styles, null, 2) + "\n");

// ---------- 2. colours ----------
type RGB = [number, number, number]; // sRGB 0..1
const clamp = (x: number) => Math.min(1, Math.max(0, x));
function hslToRgb(h: number, s: number, l: number): RGB {
  const k = (n: number) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}
function oklchToRgb(L: number, C: number, hDeg: number): RGB {
  const h = (hDeg * Math.PI) / 180, a = C * Math.cos(h), b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
  return lin.map((v) => clamp(v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)) as RGB;
}
function parseColor(css: string): RGB | null {
  const t = css.trim();
  let m = /^#([0-9a-f]{3,8})$/i.exec(t);
  if (m) {
    let h = m[1]!; if (h.length <= 4) h = [...h].map((c) => c + c).join("");
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as RGB;
  }
  m = /^hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%/i.exec(t);
  if (m) return hslToRgb(+m[1]!, +m[2]! / 100, +m[3]! / 100);
  m = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)/i.exec(t);
  if (m) return oklchToRgb(m[2] ? +m[1]! / 100 : +m[1]!, +m[3]!, +m[4]!);
  m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(t);
  if (m) return [+m[1]! / 255, +m[2]! / 255, +m[3]! / 255];
  return null;
}
const hex = (c: RGB) => "#" + c.map((v) => Math.round(clamp(v) * 255).toString(16).padStart(2, "0")).join("");
const lin = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const luminance = (c: RGB) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
const contrast = (a: RGB, b: RGB) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x! + 0.05) / (y! + 0.05); };
function hsl(c: RGB): { h: number; s: number; l: number } {
  const mx = Math.max(...c), mn = Math.min(...c), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = mx === c[0] ? ((c[1] - c[2]) / d) % 6 : mx === c[1] ? (c[2] - c[0]) / d + 2 : (c[0] - c[1]) / d + 4;
  return { h: (h * 60 + 360) % 360, s, l };
}

type Tokens = { primary: RGB; background: RGB; foreground: RGB };
type SkinInfo = { name: string; light: Tokens; dark: Tokens };
const skinCache = new Map<string, SkinInfo>();
function skinInfo(skin: string): SkinInfo {
  const hit = skinCache.get(skin); if (hit) return hit;
  const file = join(SKINS, `${skin}.css`);
  if (!existsSync(file)) throw new Error(`no skin css for "${skin}" at ${file}`);
  const css = readFileSync(file, "utf8");
  const name = new RegExp(`Skin "${skin}" \\(([^)]+)\\)`).exec(css)?.[1] ?? skin.split("-").map((w) => w[0]!.toUpperCase() + w.slice(1)).join(" ");
  const vars = (dark: boolean) => {
    const out: Record<string, string> = {};
    for (const m of css.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
      const sel = m[1]!;
      if (!sel.includes(`data-skin="${skin}"`) || /\.dark|data-theme="dark"/.test(sel) !== dark) continue;
      for (const d of m[2]!.matchAll(/--([\w-]+):\s*([^;]+);/g)) out[d[1]!] = d[2]!;
    }
    return out;
  };
  const light = vars(false), dark = vars(true);
  const tok = (v: Record<string, string>, f: Record<string, string>, k: string): RGB => {
    const c = parseColor(v[k] ?? f[k] ?? ""); if (!c) throw new Error(`skin ${skin}: cannot read --${k}`); return c;
  };
  const mk = (v: Record<string, string>, f: Record<string, string>): Tokens => ({ primary: tok(v, f, "primary"), background: tok(v, f, "background"), foreground: tok(v, f, "foreground") });
  const info = { name, light: mk(light, light), dark: mk(dark, light) };
  skinCache.set(skin, info); return info;
}

// ---------- 3. taste ----------
const FONT_NAMES: Record<string, string> = { inter: "Inter", roboto: "Roboto", manrope: "Manrope", montserrat: "Montserrat", rubik: "Rubik", nunito: "Nunito", "ibm-plex-sans": "IBM Plex Sans", "golos-text": "Golos Text", onest: "Onest", "open-sans": "Open Sans" };
const FONT_CHARACTER: Record<string, string> = {
  inter: "neutral screen grotesque", roboto: "familiar mechanical-humanist sans", manrope: "modern semi-rounded geometric sans", montserrat: "wide geometric sans with urban poster presence",
  rubik: "slightly rounded blocky sans", nunito: "soft rounded sans", "ibm-plex-sans": "technical, engineered humanist sans", "golos-text": "calm, even grotesque", onest: "clean contemporary grotesque", "open-sans": "open, friendly humanist sans",
};
const DENSITY: Record<string, string> = { poster: "sparse", split: "balanced", "full-bleed": "balanced", "dense-grid": "dense", airy: "very sparse", stats: "medium-dense", ribbon: "medium", editorial: "dense", frame: "balanced", prompt: "sparse" };
const hueName = (h: number, s: number) => s < 0.12 ? "neutral" : h < 15 || h >= 345 ? "red" : h < 45 ? "orange" : h < 70 ? "amber" : h < 160 ? "green" : h < 200 ? "teal" : h < 255 ? "blue" : h < 290 ? "violet" : "pink";
const WARM = new Set(["red", "orange", "amber", "pink"]);

type Taste = { mood: string; density: string; contrast: string; type: string; metrics: Record<string, string> };
function tasteOf(s: IncludedStyle, composition: string): Taste & { night: string } {
  const k = skinInfo(s.skin), L = k.light, D = k.dark;
  const bl = hsl(L.background).l, bd = hsl(D.background).l;
  const cl = contrast(L.foreground, L.background), cd = contrast(D.foreground, D.background);
  const p = hsl(L.primary), hue = hueName(p.h, p.s);
  const sat = p.s < 0.15 ? "neutral" : p.s < 0.5 ? "muted" : p.s < 0.8 ? "saturated" : "vivid";
  const cAvg = (cl + cd) / 2, contrastWord = cAvg >= 15 ? "high" : cAvg >= 9 ? "medium" : "gentle";
  const temp = hue === "neutral" ? "neutral" : WARM.has(hue) ? "warm" : "cool";
  const shape = s.radius === 0 ? "sharp-cornered" : s.radius <= 4 ? "crisp" : s.radius <= 8 ? "softly rounded" : s.radius <= 12 ? "rounded" : "pillowy";
  const surface = bl > 0.9 ? "bright" : bl > 0.6 ? "pale" : "tinted";
  const night = bd < 0.15 ? "deep dark mode" : bd < 0.3 ? "dark mode" : "light-toned dark mode";
  const same = s.fonts.display === s.fonts.body;
  const d = FONT_NAMES[s.fonts.display] ?? s.fonts.display, b = FONT_NAMES[s.fonts.body] ?? s.fonts.body;
  const type = same ? `a single family, ${d}: ${FONT_CHARACTER[s.fonts.display] ?? "sans"}` : `${d} for display (${FONT_CHARACTER[s.fonts.display] ?? "sans"}) over ${b} for text (${FONT_CHARACTER[s.fonts.body] ?? "sans"})`;
  const density = DENSITY[composition] ?? "balanced";
  const mood = `${temp} ${hue === "neutral" ? "" : hue + " "}accent, ${sat}; ${surface} surfaces, ${shape} corners`.replace(/\s+/g, " ");
  const metrics = {
    "contrast fg/bg (light, dark)": `${cl.toFixed(1)}:1, ${cd.toFixed(1)}:1`,
    "primary vs background (light, dark)": `${contrast(L.primary, L.background).toFixed(1)}:1, ${contrast(D.primary, D.background).toFixed(1)}:1`,
    "primary hue / saturation / lightness": `${Math.round(p.h)}° / ${Math.round(p.s * 100)}% / ${Math.round(p.l * 100)}%`,
    "background lightness (light, dark)": `${Math.round(bl * 100)}%, ${Math.round(bd * 100)}%`,
  };
  return { mood, density, contrast: contrastWord, type, metrics, night } as Taste & { night: string };
}

// ---------- 4. markdown ----------
const firstComment = (file: string): string => {
  if (!existsSync(file)) return "";
  const m = /<!--\s*([\s\S]*?)\s*-->/.exec(readFileSync(file, "utf8"));
  return m ? m[1]!.replace(/\s+/g, " ").trim() : "";
};
const BLOCKS = ["hero", "hero-right", "features", "cta", "pricing", "testimonials", "faq", "footer", "stats", "logos"];
const TEMPLATES = ["blog", "store", "portfolio", "website"];
const tastes = new Map(TASTES.map((t) => [t.id, t]));

const out: string[] = [];
out.push("# Included styles", "");
out.push("<!-- Generated by `bun run included` in apps/discovery from the Discovery inbox journal (mode include). Do not edit by hand; re-run the script. -->", "");
out.push("A style is **included** when its card was outlined in Discovery with `?cards=include` and sent: this exact design (screen + skin + font pairing + radius, the card's full style) must be in the future marketplace showcase. The catalog lives in `apps/discovery/src/included.json` (typed by `included.ts`), deduped by full style `screen|skin|display+body|radius`.", "");
out.push(`${styles.length} included style${styles.length === 1 ? "" : "s"}.`, "");
if (!styles.length) out.push("_Nothing included yet._", "");
styles.forEach((s, i) => {
  const t = tastes.get(s.id);
  const layoutId = s.id.replace(/^t\d+-/, "");
  const [layoutTok, ...rest] = layoutId.split("-");
  const comp = t?.composition ?? layoutTok!;
  const recipe = t?.recipe ?? rest.join("-");
  const k = skinInfo(s.skin), ta = tasteOf(s, comp);
  const recipeDesc = firstComment(join(APP, `src/recipes/${recipe}.svelte`));
  const layoutDesc = firstComment(join(APP, `src/screens/${s.id}.svelte`));
  const tokRow = (n: string, f: (x: Tokens) => RGB) => `| ${n} | \`${hex(f(k.light))}\` | \`${hex(f(k.dark))}\` |`;
  out.push(`## ${i + 1}. ${s.id} · ${k.name} · ${FONT_NAMES[s.fonts.display] ?? s.fonts.display}${s.fonts.display === s.fonts.body ? "" : " + " + (FONT_NAMES[s.fonts.body] ?? s.fonts.body)} · r${s.radius}`, "");
  out.push(`- key: \`${s.key}\``);
  out.push(`- screen id: \`${s.id}\``);
  out.push(`- layout: **${layoutTok}**${t && t.composition !== layoutTok ? ` (composition \`${t.composition}\`)` : ""}${layoutDesc ? ` — ${layoutDesc}` : ""}`);
  const pat = COMPOSITION_OF[s.id];
  out.push(`- composition pattern: ${pat ? `**${pat.primary}**${pat.secondary ? ` (secondary ${pat.secondary})` : ""}${pat.weak ? " (weak fit)" : ""} — ${pat.note}` : "_not tagged_"}`);
  out.push(`- image recipe: **${recipe}**${recipeDesc ? ` — ${recipeDesc}` : ""}`);
  out.push(`- skin: \`${s.skin}\` (${k.name})`);
  out.push(`- font pairing: display ${FONT_NAMES[s.fonts.display] ?? s.fonts.display} (\`${s.fonts.display}\`), body ${FONT_NAMES[s.fonts.body] ?? s.fonts.body} (\`${s.fonts.body}\`)`);
  out.push(`- radius: ${s.radius}px`);
  out.push(`- included: first ${s.firstSeen || "?"}; outlined on ${s.sightings.length} card${s.sightings.length === 1 ? "" : "s"} (row from top / col): ${s.sightings.map((x) => `${x.row}/${x.col}`).join(", ")}`, "");
  out.push("| token | light | dark |", "|---|---|---|", tokRow("primary", (x) => x.primary), tokRow("background", (x) => x.background), tokRow("foreground", (x) => x.foreground), "");
  out.push(`**Taste.** ${ta.contrast[0]!.toUpperCase()}${ta.contrast.slice(1)}-contrast, ${ta.density} ${comp} layout: ${ta.mood}. Type is ${ta.type}. The dark theme is a ${ta.night}.`, "");
  out.push("Measured: " + Object.entries(ta.metrics).map(([a, b]) => `${a} ${b}`).join("; ") + ".", "");
  out.push("### Planned companion blocks", "", "Future: the detail page of this design shows its sibling blocks in the same style (same skin, fonts, radius, image recipe).", "");
  out.push(BLOCKS.map((b) => `- [ ] ${b}${b === "hero" ? " (the included screen itself)" : ""}`).join("\n"), "");
  out.push("### Planned templates", "", "Future: listed on the Templates tab of the detail page.", "", TEMPLATES.map((b) => `- [ ] ${b}`).join("\n"), "");
});
if (!args.includes("--dry")) writeFileSync(MD_PATH, out.join("\n").replace(/\n{3,}/g, "\n\n"));
console.log(`included: ${styles.length} styles (${added} new) -> ${args.includes("--dry") ? "dry run" : "src/included.json, plan/included-styles.md"}`);
