// Headless check that the theme is one model with synchronised views, against a running server (default http://localhost:5190):
// A. the style page's Design system tab -> the Theme sheet (both panels) and the site root; B. the Theme sheet -> the tab and the site;
// coverage: every field of the model (@ui8kit/theme-model/global-theme FIELDS) has a control in the Theme panel, its Design system panel and the
// tab; C. an imported config shows in all three views, survives a reload, and every export equals it. `bun scripts/e2e-theme-sync.mjs`
// (SHOTS=<dir> TAG=<name> also saves screenshots)
import { chromium } from "../../../node_modules/playwright-core/index.mjs";
const BASE = process.env.MAG_BASE ?? "http://localhost:5190";
const TAG = process.env.TAG ?? "e2e";
const OUT = process.env.SHOTS;
const P = "t071-poster-dots~bubblegum~montserrat+open-sans~0,t094-dense-flat~amber-minimal~open-sans+open-sans~4,t143-poster-stripes~neo-brutalism~montserrat+open-sans~0,t053-fullbleed-geometric~bubblegum~onest+inter~4,t033-fullbleed-rings~doom-64~onest+inter~16,t081-poster-conic~neo-brutalism~onest+inter~8,t053-fullbleed-geometric~amber-minimal~onest+inter~4,t053-fullbleed-geometric~supabase~onest+inter~0,t093-fullbleed-dots~sky~montserrat+inter~12,t053-fullbleed-geometric~claude~onest+inter~8";
const KEY = "t071-poster-dots~bubblegum~montserrat+open-sans~0";
const DS = `/magazine/?picks=${P}#/style/${KEY}/design`;
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const FIELDS = ["mode", "skin", "font", "radius", ...["badge", "button", "card", "alert", "media"].map((e) => "radius-" + e), ...["badge", "button", "card", "alert"].map((e) => "density-" + e), ...["card", "alert", "media"].map((e) => "shadow-" + e)];
let fails = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fails++; };

// what the site applies: root attrs + computed values of the chrome (outside any .mg-own / card)
const site = (p) => p.evaluate(() => {
  const r = document.querySelector(".mg-root"); const cs = getComputedStyle(r);
  const btn = document.querySelector("[data-testid=theme-open]");
  return { skin: r.getAttribute("data-skin"), radius: cs.getPropertyValue("--radius").trim(), font: cs.fontFamily.split(",")[0], rButton: cs.getPropertyValue("--radius-button").trim(),
    densCard: r.getAttribute("data-density-card"), chromeBtnRadius: btn ? getComputedStyle(btn).borderTopLeftRadius : null, bg: cs.backgroundColor, store: localStorage.getItem("magazine:v1:theme") };
});
// the values each view shows
const dsTab = (p) => p.evaluate(() => ({
  skin: document.querySelector("[data-testid=ds-skin-now]")?.textContent ?? null, font: document.querySelector("[data-testid=ds-font-now]")?.textContent ?? null,
  radius: document.querySelector("[data-testid=ds-radius-now]")?.textContent ?? null,
  rButton: document.querySelector("[data-testid=style-design] input[name$='er-button']:checked")?.value ?? null,
  densCard: document.querySelector("[data-testid=style-design] input[name$='ed-card']:checked")?.value ?? null,
  specimenBtnRadius: (() => { const e = document.querySelector("[data-testid=style-design] [data-testid$=specimen] [data-slot=button], [data-testid=style-design] .ds-specimen [data-slot=button]"); return e ? getComputedStyle(e).borderTopLeftRadius : null; })(),
  previewSkin: null,
}));
const sheet = (p) => p.evaluate(() => {
  const q = (s) => document.querySelector(s);
  return { skin: q("#filter-theme-skin")?.value ?? null, font: q("#filter-theme-font")?.value ?? null, radius: q("input[name=theme-radius]:checked")?.value ?? null,
    density: q("input[name=theme-density]:checked")?.value ?? null, mode: q("input[name=theme-mode]:checked")?.value ?? null,
    rButton: q("[data-testid=ds-panel] input[name$='er-button']:checked")?.value ?? null, densCard: q("[data-testid=ds-panel] input[name$='ed-card']:checked")?.value ?? null };
});
// coverage of a view: data-field attributes, else the control names mapped to fields
const coverage = (p, sel) => p.evaluate(({ sel, FIELDS }) => {
  const root = document.querySelector(sel); if (!root) return null;
  const out = new Set();
  root.querySelectorAll("[data-field]").forEach((e) => out.add(e.getAttribute("data-field")));
  root.querySelectorAll("input[name], select[name]").forEach((e) => {
    const n = e.getAttribute("name"); let m;
    if ((m = /-(mode|skin|font|radius)$/.exec(n)) && n.startsWith("theme-")) out.add(m[1]);
    if (n === "theme-density") ["badge", "button", "card", "alert"].forEach((x) => out.add("density-" + x + "*"));
    if ((m = /-er-(\w+)$/.exec(n))) out.add("radius-" + m[1]);
    if ((m = /-ed-(\w+)$/.exec(n))) out.add("density-" + m[1]);
    if ((m = /-es-(\w+)$/.exec(n))) out.add("shadow-" + m[1]);
  });
  if (root.querySelector("[data-testid=ds-skins]")) out.add("skin");
  if (root.querySelector("[data-testid=ds-fonts]")) out.add("font");
  if (root.querySelector("[data-testid=ds-radii]")) out.add("radius");
  if (root.querySelector("[data-testid=ds-mode], [data-testid=style-theme]")) out.add("mode");
  return [...out].filter((f) => FIELDS.includes(f.replace("*", "")) );
}, { sel, FIELDS });
const exportImport = (p) => p.evaluate(() => ({
  exportButtons: [...document.querySelectorAll("button")].filter((x) => /copy|export|json/i.test(x.textContent || "") ).map((x) => (x.dataset.testid || "") + ":" + x.textContent.trim()),
  importControls: [...document.querySelectorAll("button, textarea, input[type=file]")].filter((x) => /import/i.test((x.textContent || "") + (x.dataset.testid || ""))).map((x) => x.dataset.testid || x.textContent.trim()),
  dsJson: document.querySelector("[data-testid=ds-json]")?.textContent ?? null,
}));
const radio = async (p, name, value) => { await p.locator(`input[name="${name}"][value="${value}"]`).first().check({ force: true }); await p.waitForTimeout(150); };
const openSheet = async (p, wide) => { await p.locator("[data-testid=theme-open]").click(); await p.waitForSelector("[data-testid=theme-panel]"); if (wide) { await p.locator("[data-testid=theme-ds]").click(); await p.waitForSelector("[data-testid=ds-panel]"); } await p.waitForTimeout(400); };
const closeSheet = async (p) => { await p.locator("[data-testid=theme-close]").click(); await p.waitForTimeout(300); };
const newPage = async () => { const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, httpCredentials: { username: process.env.PREVIEW_USER ?? "admin", password: process.env.PREVIEW_PASS ?? "admin" } }); const p = await ctx.newPage(); const errs = []; p.on("pageerror", (e) => errs.push(String(e).slice(0, 200))); p.errs = errs; return p; };
const go = async (p, path) => { await p.goto(BASE + path, { waitUntil: "load" }); await p.waitForSelector("[data-testid=style-design]", { timeout: 30000 }); await p.waitForTimeout(1500); };

const report = {};
// A. Design system tab -> Theme sheet / site
{
  const p = await newPage();
  await go(p, DS);
  report.A0 = { site: await site(p), ds: await dsTab(p) };
  await p.locator("[data-testid=ds-skin-claude]").click(); await p.locator("[data-testid=ds-font-inter]").click(); await p.locator("[data-testid=ds-radius-16]").click();
  await radio(p, "ds-er-button", "4"); await radio(p, "ds-ed-card", "comfortable");
  await p.waitForTimeout(500);
  report.A1 = { site: await site(p), ds: await dsTab(p) };
  await openSheet(p, true);
  report.A1.sheet = await sheet(p);
  report.coverage = { themePanel: await coverage(p, "[data-testid=theme-panel]"), dsPanel: await coverage(p, "[data-testid=ds-panel]") };
  report.exportImportSheet = await exportImport(p);
  if (OUT) await p.screenshot({ path: `${OUT}/${TAG}-A-ds-tab-then-theme.png` });
  await closeSheet(p);
  report.coverage.dsTab = await coverage(p, "[data-testid=magazine-style]");
  report.exportImportTab = await exportImport(p);
  await p.reload({ waitUntil: "load" }); await p.waitForSelector("[data-testid=style-design]"); await p.waitForTimeout(1500);
  report.A2reload = { site: await site(p), ds: await dsTab(p) };
  report.A = { errs: p.errs };
  await p.context().close();
}
// B. Theme sheet -> Design system tab
{
  const p = await newPage();
  await go(p, DS);
  await openSheet(p, true);
  await p.selectOption("#filter-theme-skin", "claude"); await p.selectOption("#filter-theme-font", "inter");
  await radio(p, "theme-radius", "16");
  await radio(p, "gt-er-button", "4"); await radio(p, "gt-ed-card", "comfortable");
  report.B1 = { sheet: await sheet(p), site: await site(p) };
  if (OUT) await p.screenshot({ path: `${OUT}/${TAG}-B-theme-sheet.png` });
  await closeSheet(p);
  report.B1.ds = await dsTab(p);
  if (OUT) await p.screenshot({ path: `${OUT}/${TAG}-B-ds-tab-after-theme.png` });
  await p.reload({ waitUntil: "load" }); await p.waitForSelector("[data-testid=style-design]"); await p.waitForTimeout(1500);
  report.B2reload = { site: await site(p), ds: await dsTab(p) };
  report.B = { errs: p.errs };
  await p.context().close();
}
// C. import a full config in the Theme sheet; both panels and the DS tab show every field with the same value; exports agree
{
  const p = await newPage();
  await go(p, DS);
  const io = await p.locator("[data-testid=ds-io]").count();
  if (io) {
    const cfg = { format: "magazine-theme", version: 2, mode: "light", skin: "supabase", font: "manrope", radius: 12,
      tokens: { "radius-badge": 4, "radius-button": 0, "radius-card": 16, "radius-alert": 8, "radius-media": 12, "density-badge": "compact", "density-button": "comfortable", "density-card": "compact", "density-alert": "comfortable", "shadow-card": "md", "shadow-alert": "sm", "shadow-media": "none" } };
    await openSheet(p, true);
    await p.locator("[data-testid=gt-io-text]").fill(JSON.stringify(cfg));
    await p.locator("[data-testid=gt-import]").click(); await p.waitForTimeout(500);
    const want = { mode: "light", skin: "supabase", font: "manrope", radius: "12", ...Object.fromEntries(Object.entries(cfg.tokens).map(([k, v]) => [k, String(v)])) };
    const shown = (sel) => p.evaluate(({ sel }) => { const out = {}; document.querySelectorAll(sel + " [data-field]").forEach((g) => { const id = g.getAttribute("data-field"); const sel_ = g.querySelector("select"); const r = g.querySelector("input:checked"); const ch = g.querySelector("[aria-checked=true]"); out[id] = sel_ ? sel_.value : r ? r.value : ch ? (ch.dataset.testid || "").replace(/^ds-(skin|font|radius)-/, "") : null; }); return out; }, { sel });
    report.C = { status: await p.locator("[data-testid=gt-io-status]").textContent(), themePanel: await shown("[data-testid=theme-panel]"), dsPanel: await shown("[data-testid=ds-panel]") };
    if (OUT) await p.screenshot({ path: `${OUT}/${TAG}-C-imported-sheet.png` });
    await p.locator("[data-testid=theme-export]").click(); await p.waitForTimeout(300);
    report.C.exportSheet = JSON.parse(await p.locator("[data-testid=theme-io-text]").inputValue());
    await closeSheet(p);
    report.C.dsTab = await shown("[data-testid=style-design]");
    await p.locator("[data-testid=ds-export]").click(); await p.waitForTimeout(300);
    report.C.exportTab = JSON.parse(await p.locator("[data-testid=ds-io-text]").inputValue());
    report.C.site = await site(p);
    if (OUT) await p.screenshot({ path: `${OUT}/${TAG}-C-ds-tab-after-import.png` });
    await p.reload({ waitUntil: "load" }); await p.waitForSelector("[data-testid=style-design]"); await p.waitForTimeout(1500);
    report.C.reload = await shown("[data-testid=style-design]");
    const same = (got) => Object.entries(want).filter(([k, v]) => got[k] !== v).map(([k, v]) => `${k}:${got[k]}!=${v}`);
    report.C.diff = { themePanel: same(report.C.themePanel), dsPanel: same(report.C.dsPanel), dsTab: same(report.C.dsTab), reload: same(report.C.reload) };
    report.C.exportsEqual = JSON.stringify(report.C.exportSheet) === JSON.stringify(report.C.exportTab) && JSON.stringify(report.C.exportSheet) === JSON.stringify(cfg);
    report.C.errs = p.errs;
  }
  await p.context().close();
}
await b.close();
if (process.env.VERBOSE) console.log(JSON.stringify(report, null, 1));
// verdicts
const A = report.A1, B = report.B1;
ok(A.sheet.skin === "claude", "A: DS tab skin claude -> Theme sheet skin = " + A.sheet.skin);
ok(A.sheet.radius === "16", "A: DS tab radius 16 -> Theme sheet radius = " + A.sheet.radius);
ok(A.sheet.rButton === "4", "A: DS tab radius-button 4 -> DS panel = " + A.sheet.rButton);
ok(A.site.skin === "claude" && A.site.radius === "16px", `A: site root skin/radius = ${A.site.skin}/${A.site.radius}`);
ok(A.site.chromeBtnRadius === "4px", "A: chrome button radius = " + A.site.chromeBtnRadius);
ok(report.A2reload.ds.skin === "claude", "A: DS tab persists after reload = " + report.A2reload.ds.skin);
ok(B.ds.skin === "claude" && B.ds.radius === "16px", `B: Theme -> DS tab skin/radius = ${B.ds.skin}/${B.ds.radius}`);
ok(B.ds.rButton === "4", "B: Theme DS panel radius-button 4 -> DS tab = " + B.ds.rButton);
ok(B.site.skin === "claude" && B.site.chromeBtnRadius === "4px", `B: site skin/chrome btn = ${B.site.skin}/${B.site.chromeBtnRadius}`);
const full = (c) => c && FIELDS.every((f) => c.includes(f));
const miss = (c) => c ? FIELDS.filter((f) => !c.includes(f)) : FIELDS;
ok(full(report.coverage.themePanel), "coverage Theme panel, missing: " + miss(report.coverage.themePanel).join(","));
ok(full(report.coverage.dsPanel), "coverage DS panel (2nd sheet), missing: " + miss(report.coverage.dsPanel).join(","));
ok(full(report.coverage.dsTab), "coverage DS tab, missing: " + miss(report.coverage.dsTab).join(","));
ok(report.exportImportSheet.importControls.length > 0, "import control exists: " + JSON.stringify(report.exportImportSheet.importControls));
ok((report.A.errs ?? []).length === 0 && report.B.errs.length === 0, "no page errors");
if (report.C) {
  for (const [k, d] of Object.entries(report.C.diff)) ok(d.length === 0, `C: imported config shown in ${k}: ${d.join(" ") || "all 16 fields equal"}`);
  ok(report.C.exportsEqual, "C: export of Theme sheet == export of DS tab == imported config");
  ok(report.C.site.skin === "supabase" && report.C.site.radius === "12px", `C: site root after import ${report.C.site.skin}/${report.C.site.radius}`);
  ok(report.C.errs.length === 0, "C: no page errors");
} else ok(false, "C: no export/import in the Design system tab");
console.log(`\n${TAG}: ${fails} FAIL`);
process.exit(fails ? 1 : 0);
