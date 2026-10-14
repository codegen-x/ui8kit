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
  await keep(p, "sheet");
  await p.locator("[data-name=radius] input[value='16']").check();
  await p.locator("[data-name=task] input[value='shop']").check();
  await p.locator("[data-testid=filter-update]").click();
  await p.waitForSelector("dialog[open]", { state: "detached" }).catch(() => {});
  ok(!(await p.locator("dialog[open]").count()), "sheet closes on update");
  const s = await search(p);
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
  const v = await validateStates(resolve(import.meta.dir, "../../.."), states);
  ok(v.problems.length === 0, `html-validate: ${v.documents} documents, ${v.problems.length} problem(s)`);
  for (const m of v.problems) console.log("     " + m);

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
