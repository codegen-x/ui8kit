#!/usr/bin/env bun
// One-time tool: writes the names, notes and variant labels of the blocks (written next to each block in packages/compose-gen/screens/src/authoring/gallery/blocks*.ts)
// into the dictionary packages/compose-gen/content/ui/en.json under blocks.names, blocks.docs and blocks.variants. Run it after you add or rename a block or a variant.
// usage: bun packages/compose-gen/screens/tools/author-block-texts.ts
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { blockTexts } from "../src/index";
import { catalogTexts } from "../src/authoring/gallery/catalog";
import { skinsTexts } from "../src/authoring/gallery/skins";

const file = join(import.meta.dir, "../../content/ui/en.json");
const dict = JSON.parse(readFileSync(file, "utf8")) as { blocks: Record<string, unknown>; catalog?: unknown; skins?: unknown };
dict.blocks["names"] = Object.fromEntries(Object.entries(blockTexts).map(([k, v]) => [k, v.name]));
dict.blocks["docs"] = Object.fromEntries(Object.entries(blockTexts).map(([k, v]) => [k, v.docs]));
dict.blocks["variants"] = Object.fromEntries(Object.entries(blockTexts).map(([k, v]) => [k, v.variants]));
dict.catalog = catalogTexts;
dict.skins = skinsTexts;
// a specimen of Cyrillic letters (the font tiles of /skins/) is written as \u escapes: the sources stay free of Cyrillic text
// non-ASCII as \uXXXX, as the file is stored (and no Cyrillic in a tracked file)
const escapeCyrillic = (s: string): string => s.replace(/[^\x00-\x7f]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);
writeFileSync(file, escapeCyrillic(JSON.stringify(dict, null, 2)) + "\n");
console.log(`${Object.keys(blockTexts).length} blocks, ${Object.values(blockTexts).reduce((n, v) => n + Object.keys(v.variants).length, 0)} variants`);
