// Capture a WebP thumbnail of every Stock asset (each block variant, each screen) from its live render, #/frame/<id>, one
// fresh page load per asset in headless Chromium, into public/thumbs/ (scripts/lib/thumbs.ts); stale files are removed.
// On demand, not in CI. Serve a build of this commit first, then run build-index so the assets carry `thumb`:
//   bun run --cwd apps/stock build && bun run --cwd apps/stock preview          (http://127.0.0.1:5188/stock/)
//   bun apps/stock/scripts/thumbs.ts [--url http://127.0.0.1:5188/stock/] [--only <id>] [--jobs 4]
//   bun run --cwd apps/stock index
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium, type Browser } from "playwright-core";
import { THUMB, THUMBS_DIR, thumbFile } from "./lib/thumbs";

const arg = (name: string): string | undefined => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : undefined; };
const base = arg("--url") ?? "http://127.0.0.1:5188/stock/";
const only = arg("--only");
const jobs = Number(arg("--jobs") ?? 4);
const index = JSON.parse(readFileSync(join(import.meta.dir, "..", "content", "assets.v0.json"), "utf8")) as { assets: { id: string; preview: unknown }[] };
const ids = index.assets.filter((a) => a.preview && (!only || a.id === only)).map((a) => a.id);

async function launch(): Promise<Browser> {
  return chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
}

const browser = await launch();
const context = await browser.newContext({ viewport: { width: THUMB.width, height: THUMB.height }, deviceScaleFactor: 1, colorScheme: "light" });
// the light theme of the kit toggle (the app defaults to dark)
await context.addInitScript(() => { try { localStorage.setItem("codegen-x-theme", "light"); } catch { /* storage off */ } });
mkdirSync(THUMBS_DIR, { recursive: true });

const failed: string[] = [];
let done = 0;
async function capture(id: string): Promise<void> {
  const page = await context.newPage();
  try {
    await page.goto(`${base}#/frame/${id}`, { waitUntil: "networkidle", timeout: 60000 });
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    await page.waitForTimeout(300);
    const empty = await page.evaluate(() => document.body.innerText.trim().length === 0 && document.querySelectorAll("img,svg").length === 0);
    if (empty) throw new Error("empty render");
    const cdp = await context.newCDPSession(page);
    const { data } = (await cdp.send("Page.captureScreenshot", {
      format: "webp", quality: THUMB.quality, clip: { x: 0, y: 0, width: THUMB.width, height: THUMB.height, scale: THUMB.scale },
    })) as { data: string };
    writeFileSync(join(THUMBS_DIR, thumbFile(id)), Buffer.from(data, "base64"));
  } catch (e) {
    failed.push(`${id}: ${(e as Error).message.split("\n")[0]}`);
  } finally {
    await page.close();
    done += 1;
    if (done % 50 === 0) console.log(`thumbs: ${done}/${ids.length}`);
  }
}

const queue = [...ids];
await Promise.all(Array.from({ length: Math.max(1, jobs) }, async () => { for (let id = queue.shift(); id; id = queue.shift()) await capture(id); }));
await browser.close();

if (!only) {
  const keep = new Set(ids.map(thumbFile));
  for (const f of readdirSync(THUMBS_DIR)) if (!keep.has(f)) rmSync(join(THUMBS_DIR, f));
}
const bytes = readdirSync(THUMBS_DIR).reduce((s, f) => s + Bun.file(join(THUMBS_DIR, f)).size, 0);
console.log(`thumbs: ${ids.length - failed.length}/${ids.length} written, ${readdirSync(THUMBS_DIR).length} files, ${(bytes / 1024 / 1024).toFixed(2)} MiB`);
if (failed.length) { console.error(failed.join("\n")); process.exit(1); }
