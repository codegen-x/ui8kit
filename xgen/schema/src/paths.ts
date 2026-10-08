// Where things live inside the xgen folder. One place, so no package spells a path of another's data on its own.
import { join } from "node:path";

export interface XgenPaths {
  root: string;
  /** specs/<kind>: ui, organisms, parts, patterns, blocks, screens, recipes */
  specs: (kind: string) => string;
  fixtures: string;
  dictionary: string;
  lucide: string;
  nonportable: string;
  docs: string;
}

export const xgenPaths = (root: string): XgenPaths => ({
  root,
  specs: (kind) => join(root, "specs", kind),
  fixtures: join(root, "fixtures"),
  dictionary: join(root, "content", "ui", "en.json"),
  lucide: join(root, "specs", "assets", "lucide-icons.json"),
  nonportable: join(root, "specs", "_nonportable.json"),
  docs: join(root, "docs"),
});
