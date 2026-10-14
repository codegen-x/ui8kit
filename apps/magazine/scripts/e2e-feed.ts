// Headless flow check of the tuned feed against a running server (default http://localhost:5190, Basic Auth from PREVIEW_USER /
// PREVIEW_PASS): the taste bar and the sections render, the Filters sheet opens preselected, "Update feed" rerenders the feed and
// writes the tune into the address, a shared address restores it, Reset clears it, a skin of "same structure" applies; every state
// passes html-validate (rules/html-validate.json, as the xgen e2e). SHOTS=<dir> saves desktop and mobile screenshots, light and dark.
//   bun scripts/e2e-feed.ts
import { chromium, type Page } from "../../../node_modules/playwright-core/index.mjs";
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { validateStates, type HtmlStates } from "../../../xgen/check/src/e2e/html";

const BASE = process.env.MAG_BASE ?? "http://localhost:5190";
const SHOTS = process.env.SHOTS;
const PICKS = "t071-poster-dots~bubblegum~montserrat+open-sans~0,t094-dense-flat~amber-minimal~open-sans+open-sans~4,t143-poster-stripes~neo-brutalism~montserrat+open-sans~0,t053-fullbleed-geometric~bubblegum~onest+inter~4,t033-fullbleed-rings~doom-64~onest+inter~16,t081-poster-conic~neo-brutalism~onest+inter~8,t053-fullbleed-geometric~amber-minimal~onest+inter~4,t053-fullbleed-geometric~supabase~onest+inter~0,t093-fullbleed-dots~sky~montserrat+inter~12,t053-fullbleed-geometric~claude~onest+inter~8";
const G_FONT = "Font";
let failed = 0;
const ok = (c: boolean, m: string) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) failed++; };
const states: HtmlStates = new Map();
// a card that has no snapshot yet shows its screen live (inert, aria-hidden, CSS-scaled): those screens are validated by their own
// e2e, and a screen inside the card's link is not markup of the feed, so the live previews are left out here
const keep = async (p: Page, name: string) => {
  const h = "<!DOCTYPE html>\n" + (await p.evaluate(() => { const d = document.documentElement.cloneNode(true) as HTMLElement; d.querySelectorAll(".mg-live").forEach((e) => e.remove()); return d.outerHTML; })); states.set(h, [...(states.get(h) ?? []), name]); };

const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox", "--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await browser.newContext({ httpCredentials: { username: process.env.PREVIEW_USER ?? "admin", password: process.env.PREVIEW_PASS ?? "admin" }, viewport: { width: 1440, height: 900 } });
const open = async (query: string, c: typeof ctx = ctx) => {
  const p = await c.newPage();
  await p.goto(`${BASE}/magazine/?picks=${PICKS}${query}`);
  await p.waitForSelector("[data-testid=taste-bar]", { timeout: 20000 });
  return p;
};
const search = (p: Page) => p.evaluate(() => location.search);

try {
  const p = await open("");
  const sections = await p.locator("[data-testid=feed-section]").evaluateAll((els) => els.map((e) => e.getAttribute("data-section")));
  ok(JSON.stringify(sections.slice(0, 4)) === JSON.stringify(["closest", "structure", "opposite", "unexpected-0"]), `sections in order: ${sections.join(", ")}`);
  ok(await p.locator("[data-testid=feed-insert]").count() >= 3, "inserts between sections");
  ok(await p.locator("[data-section=closest] [data-testid=why]").count() === 8, "every closest card says why");
  await keep(p, "feed");
  await p.locator("[data-testid=filters]").click();
  await p.waitForSelector("dialog[open][data-testid=filter-sheet]");
  ok(await p.locator("[data-name=radius] input:checked").getAttribute("value") === "4", "sheet preselects the derived radius");
  ok(await p.locator("[role=group][aria-labelledby] input[type=checkbox]").count() > 0 && await p.locator("[role=radiogroup][aria-labelledby] input[type=radio]").count() > 0, "toggle groups keep checkbox and radio group semantics");
  ok(await p.getByLabel(G_FONT).count() === 1, "font select has its label");
  ok(await p.locator("[data-testid=filter-select-font]").inputValue() === "onest~inter", "font select preselects the derived pair");
  await keep(p, "sheet");
  await p.locator("[data-name=radius] input[value='16']").check();
  await p.locator("[data-name=task] input[value='shop']").check();
  await p.locator("[data-testid=filter-select-font]").selectOption("manrope~manrope");
  await p.locator("[data-testid=filter-update]").click();
  await p.waitForSelector("dialog[open]", { state: "detached" }).catch(() => {});
  ok(!(await p.locator("dialog[open]").count()), "sheet closes on update");
  const s = await search(p);
  ok(decodeURIComponent(s).includes("f=manrope~manrope"), "font select applies");
  ok(s.includes("r=16") && s.includes("task=shop") && s.startsWith("?picks="), `address keeps the tune: ${s.slice(-20)}`);
  ok((await p.locator("[data-section=closest] [data-testid=card]").first().getAttribute("data-key"))!.endsWith("|16"), "closest cards rerender with radius 16");
  ok(await p.locator("[data-testid=taste-bar]").getAttribute("data-tuned") === "1", "taste bar shows tuned");
  await keep(p, "tuned");
  const q = await open(s.replace(/^\?picks=[^&]*/, ""));
  ok((await q.locator("[data-section=closest] [data-testid=card]").first().getAttribute("data-key"))!.endsWith("|16"), "a shared address restores the tune");
  await q.locator("[data-testid=taste-reset]").click();
  ok(!(await search(q)).includes("r=16"), "Reset drops the tune");
  const skin = await q.locator("[data-testid=apply-skin]:not([disabled])").first().getAttribute("data-skin");
  await q.locator("[data-testid=apply-skin]:not([disabled])").first().click();
  ok((await q.locator("[data-section=closest] [data-testid=card]").first().getAttribute("data-key"))!.includes(`|${skin}|`), `applying a skin restyles the feed (${skin})`);
  await q.locator("[data-testid=feed-more]").click();
  ok(await q.locator("[data-testid=feed-page]").count() === 2, "Show more adds a page");
  await keep(q, "more");
  // the global Theme sheet: the whole site changes, card overrides stay, the Design system panel docks flush on the left
  const card0 = await q.locator("[data-section=closest] [data-testid=card]").first().getAttribute("data-key");
  const q0 = await search(q);
  const bg0 = await q.evaluate(() => getComputedStyle(document.querySelector(".mg-header")!).backgroundColor);
  await q.locator("[data-testid=theme-open]").click();
  await q.waitForSelector("dialog[open][data-testid=theme-sheet]");
  await q.locator("[data-testid=filter-select-theme-skin]").selectOption("claude");
  ok(await q.locator("[data-testid=magazine-root]").getAttribute("data-skin") === "claude", "theme: the root takes the skin");
  ok(await q.evaluate(() => getComputedStyle(document.querySelector(".mg-header")!).backgroundColor) !== bg0, "theme: the site chrome changes colour");
  ok(await q.locator("[data-section=closest] [data-testid=card]").first().getAttribute("data-key") === card0 && (await search(q)) === q0, "theme: card overrides and the feed tune are untouched");
  ok(JSON.parse((await q.evaluate(() => localStorage.getItem("magazine:v1:theme")))!).theme.skin === "claude", "theme: saved on this device");
  await q.locator("[data-testid=theme-ds]").click();
  await q.waitForSelector("[data-testid=ds-panel]");
  const edges = await q.evaluate(() => { const w = document.querySelector("[data-testid=ds-panel]")!.getBoundingClientRect(), n = document.querySelector("[data-testid=theme-panel]")!.getBoundingClientRect(); return { w: w.right, n: n.left, wv: w.width > 400 && w.left >= 0, nv: n.right <= innerWidth + 1 }; });
  ok(Math.abs(edges.w - edges.n) < 1 && edges.wv && edges.nv, "theme: the wide Design system panel is flush left of the narrow one");
  await q.locator("[data-name=gt-er-card] input[value='16']").check();
  const vars = await q.evaluate(() => ({ root: getComputedStyle(document.querySelector("[data-testid=magazine-root]")!).getPropertyValue("--radius-card").trim(), shot: getComputedStyle(document.querySelector(".mg-shot")!).getPropertyValue("--radius-card").trim() }));
  ok(vars.root === "16px" && vars.shot === "", `theme: a global token stops at the card boundary (root ${vars.root}, card ${vars.shot || "unset"})`);
  await keep(q, "theme-both");
  await q.locator("[data-testid=theme-close]").click();
  ok(!(await q.locator("dialog[open]").count()) && await q.locator("[data-testid=theme-sheet]").isHidden(), "theme: Close hides the sheet");
  await q.locator("[data-testid=apply-skin]:not([disabled])").first().click();
  ok(await q.locator("[data-testid=magazine-root]").getAttribute("data-skin") === "claude", "feed: applying a card skin keeps the global theme");
  await q.reload();
  await q.waitForSelector("[data-testid=taste-bar]");
  ok(await q.locator("[data-testid=magazine-root]").getAttribute("data-skin") === "claude", "theme: restored after reload");
  const m = await browser.newContext({ httpCredentials: { username: process.env.PREVIEW_USER ?? "admin", password: process.env.PREVIEW_PASS ?? "admin" }, viewport: { width: 390, height: 844 } });
  const mp = await open("", m);
  await mp.locator("[data-testid=theme-open]").click();
  await mp.locator("[data-testid=theme-ds]").click();
  ok(await mp.locator("[data-testid=ds-panel]").isVisible() && !(await mp.locator("[data-testid=theme-panel]").isVisible()), "mobile: the Design system panel replaces the Theme panel");
  await keep(mp, "theme-mobile-wide");
  await mp.locator("[data-testid=ds-back]").click();
  ok(await mp.locator("[data-testid=theme-panel]").isVisible() && !(await mp.locator("[data-testid=ds-panel]").count()), "mobile: Back returns to the Theme panel");
  await m.close();

  const v = await validateStates(resolve(import.meta.dir, "../../.."), states);
  ok(v.problems.length === 0, `html-validate: ${v.documents} documents, ${v.problems.length} problem(s)`);
  for (const m of v.problems) console.log("     " + m);

  // the sheet at short viewports: full height, head and foot always in view, the body scrolls, a focused option scrolls into view
  const SHEET_SHOTS = process.env.SHEET_SHOTS;
  if (SHEET_SHOTS) mkdirSync(SHEET_SHOTS, { recursive: true });
  for (const [w, h] of [[1440, 600], [390, 600], [390, 844], [1440, 900]] as const) {
    for (const theme of ["light", "dark"] as const) {
      if (theme === "dark" && !SHEET_SHOTS) continue;
      const c = await browser.newContext({ httpCredentials: { username: process.env.PREVIEW_USER ?? "admin", password: process.env.PREVIEW_PASS ?? "admin" }, viewport: { width: w, height: h }, deviceScaleFactor: w < 500 ? 2 : 1 });
      await c.addInitScript((t) => localStorage.setItem("xgen-theme", t), theme);
      const x = await open("", c);
      await x.locator("[data-testid=taste-filters]").click();
      await x.waitForSelector("dialog[open][data-testid=filter-sheet]");
      const g = await x.evaluate(() => {
        const r = (s: string) => document.querySelector(s)!.getBoundingClientRect();
        const body = document.querySelector("[data-testid=filter-body]")!;
        return { sheet: r("dialog[open]"), head: r(".mg-sheet-head"), foot: r(".mg-sheet-foot"), scrolls: body.scrollHeight > body.clientHeight, oy: getComputedStyle(body).overflowY, vh: innerHeight };
      });
      const tag = `${w}x${h} ${theme}`;
      ok(Math.abs(g.sheet.height - g.vh) < 2 && g.head.top >= 0 && g.foot.bottom <= g.vh + 1 && g.foot.top < g.vh, `${tag}: sheet full height, head and foot in view`);
      ok(g.oy === "auto" && g.scrolls, `${tag}: body scrolls`);
      const last = x.locator("[data-name=media] input").last();
      await last.focus();
      const seen = await last.evaluate((el) => { const b = el.getBoundingClientRect(), f = document.querySelector(".mg-sheet-foot")!.getBoundingClientRect(); return b.top >= 0 && b.bottom <= f.top + 1; });
      ok(seen, `${tag}: a focused option scrolls into view above the foot`);
      if (SHEET_SHOTS) {
        const name = `sheet-${w}x${h}-${theme}`;
        await x.evaluate(() => { const b = document.querySelector("[data-testid=filter-body]")!; b.scrollTop = 0; });
        await x.waitForTimeout(300);
        await x.screenshot({ path: join(SHEET_SHOTS, `${name}.png`) });
        await x.evaluate(() => { const b = document.querySelector("[data-testid=filter-body]")!; b.scrollTop = (b.scrollHeight - b.clientHeight) / 2; });
        await x.waitForTimeout(300);
        await x.screenshot({ path: join(SHEET_SHOTS, `${name}-middle.png`) });
      }
      await c.close();
    }
  }

  if (SHOTS) {
    mkdirSync(SHOTS, { recursive: true });
    for (const [name, w, h] of [["desktop", 1440, 900], ["mobile", 390, 844]] as const) {
      for (const theme of ["light", "dark"] as const) {
        const c = await browser.newContext({ httpCredentials: { username: process.env.PREVIEW_USER ?? "admin", password: process.env.PREVIEW_PASS ?? "admin" }, viewport: { width: w, height: h }, colorScheme: theme, deviceScaleFactor: name === "mobile" ? 2 : 1 });
        await c.addInitScript((t) => localStorage.setItem("xgen-theme", t), theme); // the app's saved theme (packages/shared/app runtime/theme)
        const x = await open("", c);
        await x.waitForTimeout(4000);
        await x.screenshot({ path: join(SHOTS, `feed-${name}-${theme}.png`) });
        await x.screenshot({ path: join(SHOTS, `feed-${name}-${theme}-full.png`), fullPage: true });
        await x.locator("[data-testid=filters]").click();
        await x.waitForTimeout(500);
        await x.screenshot({ path: join(SHOTS, `filters-${name}-${theme}.png`) });
        await c.close();
      }
    }
  }
} finally { await browser.close(); }
console.log(failed ? `${failed} failed` : "e2e feed: ok");
process.exit(failed ? 1 : 0);
