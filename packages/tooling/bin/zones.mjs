#!/usr/bin/env node
// Prints the zones catalog assembled from the "ui8kit" field of every workspace package.json.
//   codegen-x-zones       print it
//   codegen-x-zones --write  write rules/zones.json (the rules gate of bun run check, fails when the copy is stale)
import fs from "node:fs";
import path from "node:path";
import { REPO } from "../src/app.mjs";
import { ZONES_FILE, zonesText } from "../src/zones.mjs";

const text = zonesText(REPO);
if (process.argv.includes("--write")) { fs.writeFileSync(path.join(REPO, ZONES_FILE), text); console.log(`wrote ${ZONES_FILE}`); }
else process.stdout.write(text);
