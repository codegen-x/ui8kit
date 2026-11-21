// The simple line, wave 3: IT and small business (organisms in blocks/simple-business.ts, one content model each). The group
// of each block is the Stock group of its kind (apps/stock): features (services). Variants only set axes, plus the default of `align`.
import { ref } from "../../build";
import { define } from "./blocks-define";
import { t } from "./block-kit";
import * as d from "./blocks-data";

const k = (block: string) => (key: string) => t(`marketing.${block}.${key}`);
const h2 = { sel: "section h2", n: 1 };
const li = (n: string) => ({ sel: "ul > li", n });
const h3 = (n: string) => ({ sel: "ul > li h3", n });
const head = (c: (key: string) => ReturnType<typeof t>) => ({ title: c("title"), description: c("description") });

const svc = k("servicesSimple");
const servicesSimple = define({
  key: "servicessimple", theme: "marketing", group: "features", line: "simple", model: "services@1",
  name: "Simple services", docs: "The heading, one paragraph and the services (the name as a link, a line, the starting price): on cards in three or two columns, or rows with the price at the end.",
  organism: "ServicesSimple", axes: ["layout", "cols"], data: [d.serviceItems],
  variants: [
    ["cards3", "Three service cards"],
    ["cards2", "Two columns", { cols: "2" }],
    ["rows", "Rows, the price at the end", { layout: "rows" }, { align: "start" }],
  ],
  facts: [h2, li("@serviceItems"), h3("@serviceItems")],
  sample: { id: "servicessimple", ...head(svc), items: ref("serviceItems") },
});

const cas = k("casesSimple");
const casesSimple = define({
  key: "casessimple", theme: "marketing", group: "proof", line: "simple", model: "cases@1",
  name: "Simple case studies", docs: "The heading, one paragraph and the case studies (a picture, the client, the title as a link, the result in one line): on cards in three or two columns, or rows with the picture at the start.",
  organism: "CasesSimple", axes: ["layout", "cols"], data: [d.caseItems],
  variants: [
    ["cards3", "Three case cards"],
    ["cards2", "Two columns", { cols: "2" }],
    ["rows", "Rows, the picture at the start", { layout: "rows" }, { align: "start" }],
  ],
  facts: [h2, li("@caseItems"), h3("@caseItems"), { sel: '[data-slot="media-frame"]', n: "@caseItems" }],
  sample: { id: "casessimple", ...head(cas), items: ref("caseItems") },
});

const tml = k("timelineSimple");
const timelineSimple = define({
  key: "timelinesimple", theme: "marketing", group: "how-it-works", line: "simple", model: "timeline@1",
  name: "Simple timeline", docs: "The heading, one paragraph and the steps of a process or a history (the date or the stage, a title, a line) as an ordered list: one column of muted steps, or side by side in two or four columns.",
  organism: "TimelineSimple", axes: ["layout", "cols"], data: [d.timelineSteps],
  variants: [
    ["column", "One column"],
    ["grid2", "Two columns", { layout: "grid" }],
    ["grid4", "Four columns", { layout: "grid", cols: "4" }, { align: "center" }],
  ],
  facts: [h2, { sel: "ol > li", n: "@timelineSteps" }, { sel: "ol > li h3", n: "@timelineSteps" }],
  sample: { id: "timelinesimple", ...head(tml), items: ref("timelineSteps") },
});

export const simpleBusinessBlocks = [servicesSimple, casesSimple, timelineSimple];
