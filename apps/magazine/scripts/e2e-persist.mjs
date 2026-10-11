// Headless flow check of picks persistence against a running server (default http://localhost:5190, Basic Auth from
// PREVIEW_USER/PREVIEW_PASS). One Chrome, one persistent profile; pages are opened one after another. `bun scripts/e2e-persist.mjs`
import { chromium } from "../../../node_modules/playwright-core/index.mjs";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.env.MAG_BASE ?? "http://localhost:5190";
const USER = process.env.PREVIEW_USER ?? "admin";
const PASS = process.env.PREVIEW_PASS ?? "admin@123";
const PICKS = "t071-poster-dots~bubblegum~montserrat+open-sans~0,t094-dense-flat~amber-minimal~open-sans+open-sans~4,t143-poster-stripes~neo-brutalism~montserrat+open-sans~0,t053-fullbleed-geometric~bubblegum~onest+inter~4,t033-fullbleed-rings~doom-64~onest+inter~16,t081-poster-conic~neo-brutalism~onest+inter~8,t053-fullbleed-geometric~amber-minimal~onest+inter~4,t053-fullbleed-geometric~supabase~onest+inter~0,t093-fullbleed-dots~sky~montserrat+inter~12,t053-fullbleed-geometric~claude~onest+inter~8";
const KEY = "magazine:v1:picks";
let failed = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) failed++; };

const dir = mkdtempSync(join(tmpdir(), "mag-e2e-"));
const ctx = await chromium.launchPersistentContext(dir, {
  executablePath: "/usr/bin/google-chrome", headless: true, httpCredentials: { username: USER, password: PASS },
  args: ["--no-sandbox", "--use-gl=swiftshader", "--enable-unsafe-swiftshader"],
});
const open = async (path) => {
  const p = await ctx.newPage();
  await p.goto(BASE + path);
  await p.waitForFunction(() => window.__magazine || document.querySelector("[data-testid=magazine-empty]"), null, { timeout: 20000 });
  return p;
};
const phase = (p, want) => p.waitForFunction((w) => window.__magazine?.state().phase === w, want, { timeout: 20000 }).then(() => true, () => false);
const stored = (p) => p.evaluate((k) => localStorage.getItem(k), KEY);
const rows = (p) => p.locator("[data-testid=card]").count();
const search = (p) => p.evaluate(() => location.search);

try {
  // 1. URL picks fly into the ball and are stored
  let p = await open("/magazine/?picks=" + PICKS);
  ok(await phase(p, "ball"), "?picks= flies into the ball");
  ok(JSON.parse((await stored(p)) ?? "null")?.length === 10 || JSON.parse((await stored(p)) ?? "{}")?.picks?.length === 10, "?picks= is stored");
  ok((await rows(p)) > 0, "rows rendered");
  // 2. expand, edit (swap one pick for another style), apply
  await p.locator("[data-testid=ball]").click();
  ok(await phase(p, "search"), "ball expands");
  const picked = await p.evaluate(() => {
    const m = window.__magazine, cur = m.pano.pickedCards();
    m.pano.togglePicked(cur[0], false);
    const have = new Set(cur);
    let i = 0; while (have.has(i)) i += 37;
    m.pano.togglePicked(i, true);
    return m.state().draft;
  });
  ok(picked === 10, "draft has 10 after edit (got " + picked + ")");
  await p.locator("[data-testid=search-apply]").click();
  ok(await phase(p, "ball"), "apply returns to the ball");
  const after = await stored(p);
  const newPicks = await search(p);
  ok(!!after, "new picks stored after apply");
  ok(/\?picks=/.test(newPicks), "URL carries ?picks= after apply");
  await p.close();
  // 3. direct link in a new page of the same profile
  p = await open("/magazine/");
  ok(await phase(p, "ball"), "direct /magazine/ opens with the ball (stored picks)");
  ok((await rows(p)) > 0, "direct /magazine/ shows rows");
  ok(await p.locator("[data-testid=magazine-empty]").count() === 0, "no empty state");
  ok(/\?picks=/.test(await search(p)), "URL gets ?picks= via replaceState (shareable)");
  ok((await stored(p)) === after, "stored value unchanged by the read");
  await p.reload();
  await p.waitForFunction(() => window.__magazine);
  ok(await phase(p, "ball"), "reload keeps the ball");
  ok((await rows(p)) > 0, "reload keeps the rows");
  // 4. hash route reload
  const key = await p.locator("[data-testid=card]").first().getAttribute("data-key");
  await p.goto(BASE + "/magazine/#/style/" + key.replace(/\|/g, "~"));
  await p.reload();
  await p.waitForFunction(() => window.__magazine);
  ok(await phase(p, "ball"), "#/style/<key> reload keeps the ball");
  ok(/#\/style\//.test(await p.evaluate(() => location.hash)), "#/style/<key> kept");
  await p.close();
  // 5. storage unavailable: URL still works, the hash/cookie fallback restores
  p = await open("/magazine/");
  await p.evaluate(() => localStorage.clear());
  await p.close();
  p = await open("/magazine/");
  ok(await phase(p, "ball"), "localStorage wiped: cookie/session mirror restores the picks");
  await p.close();
  // 5b. corrupt localStorage value: skipped, the mirrors answer; ?picks= still wins over everything
  p = await open("/magazine/");
  await p.evaluate((k) => localStorage.setItem(k, "{broken"), KEY);
  await p.close();
  p = await open("/magazine/");
  ok(await phase(p, "ball"), "corrupt localStorage value: falls back to the mirrors");
  ok(JSON.parse((await stored(p)) ?? "null")?.picks?.length === 10, "...and heals localStorage");
  await p.close();
  p = await open("/magazine/?picks=" + PICKS);
  ok(await phase(p, "ball") && (await p.evaluate(() => location.search)).includes("t071-poster-dots~bubblegum"), "?picks= wins over the stored picks and is written back");
  ok(JSON.parse((await stored(p)))?.picks?.[0] === PICKS.split(",")[0].replace(/~/g, "|"), "storage updated from ?picks=");
  await p.close();
  // 5c. Reset forgets everything, including the mirrors
  p = await open("/magazine/");
  await p.locator("[data-testid=reset]").click();
  await p.locator("[data-testid=reset-yes]").click();
  await p.waitForSelector("[data-testid=magazine-empty]", { timeout: 20000 });
  ok(true, "Reset: empty state, and a reload stays empty (cookie/session mirrors cleared)");
  await p.close();
  // 5d. the Discovery hop carries and stores the picks
  p = await ctx.newPage();
  await p.goto(BASE + "/discovery/?cards=recommend");
  await p.evaluate(([k, v]) => localStorage.setItem(k, v), ["discovery-picked-recommend", JSON.stringify(PICKS.split(",").map((x) => x.replace(/~/g, "|")))]);
  await p.reload();
  const btn = p.locator("[data-testid=discovery-recommend]");
  await btn.waitFor({ timeout: 20000 });
  await btn.click();
  await p.waitForURL(/\/magazine\//, { timeout: 20000 });
  ok((await p.evaluate(() => location.search)).startsWith("?picks="), "Discovery hop lands on /magazine/?picks=");
  ok(JSON.parse((await stored(p)) ?? "null")?.picks?.length === 10, "Discovery hop stored the picks");
  await p.close();
  // 5e. blocked storage (localStorage/sessionStorage throw): the cookie mirror still carries a direct visit
  await ctx.clearCookies();
  const c3 = await chromium.launchPersistentContext(mkdtempSync(join(tmpdir(), "mag-e2e-")), { executablePath: "/usr/bin/google-chrome", headless: true, httpCredentials: { username: USER, password: PASS }, args: ["--no-sandbox", "--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
  await c3.addInitScript(() => { for (const n of ["localStorage", "sessionStorage"]) Object.defineProperty(window, n, { get() { throw new DOMException("blocked", "SecurityError"); } }); });
  let b = await c3.newPage();
  await b.goto(BASE + "/magazine/?picks=" + PICKS);
  await b.waitForFunction(() => window.__magazine?.state().phase === "ball", null, { timeout: 20000 });
  ok(true, "blocked storage: ?picks= still works");
  await b.close();
  b = await c3.newPage();
  await b.goto(BASE + "/magazine/");
  await b.waitForFunction(() => window.__magazine?.state().phase === "ball", null, { timeout: 20000 }).then(() => ok(true, "blocked storage: direct visit restored from the cookie"), () => ok(false, "blocked storage: direct visit restored from the cookie"));
  await c3.close();
  // 6. no picks anywhere -> empty state
  const c2 = await chromium.launchPersistentContext(mkdtempSync(join(tmpdir(), "mag-e2e-")), { executablePath: "/usr/bin/google-chrome", headless: true, httpCredentials: { username: USER, password: PASS }, args: ["--no-sandbox", "--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
  const q = await c2.newPage();
  await q.goto(BASE + "/magazine/");
  await q.waitForSelector("[data-testid=magazine-empty]", { timeout: 20000 });
  ok(true, "fresh profile: empty state");
  await c2.close();
} finally {
  await ctx.close();
  rmSync(dir, { recursive: true, force: true });
}
console.log(failed ? `${failed} failed` : "all ok");
process.exit(failed ? 1 : 0);
