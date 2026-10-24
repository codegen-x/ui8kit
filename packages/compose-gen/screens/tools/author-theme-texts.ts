#!/usr/bin/env bun
// Tool: writes the head texts of the theme-app pages (written next to the pages in packages/compose-gen/screens/src/authoring/screens/themes.ts)
// into the dictionary packages/compose-gen/content/ui/en.json under `pages`,. Run it after you change a page.
// usage: bun packages/compose-gen/screens/tools/author-theme-texts.ts
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { themeTexts } from "../src/index";

const file = join(import.meta.dir, "../../content/ui/en.json");
const dict = JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>;
const pages = { ...themeTexts() };
dict["pages"] = pages;
// non-ASCII as \uXXXX, as the file is stored
writeFileSync(file, JSON.stringify(dict, null, 2).replace(/[^\x00-\x7f]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`) + "\n");
console.log(`${Object.keys(pages).length} apps, ${Object.values(pages).reduce((n, p) => n + Object.keys(p).length, 0)} pages with texts`);
