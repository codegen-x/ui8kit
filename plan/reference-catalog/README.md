# Magazine reference catalog v0.1

A free showcase of directions built in UI8Kit. 12 concepts cover the 10 existing layout families. Each has a passport and three single-axis changes: palette, fonts, radius. 20 relations explain similarity or useful contrast.

## Status and limits

Sources, curated exclusions, metadata and keys are checked. The visual review of 12 concepts is complete with findings; accessibility and usability reviews remain open. The required gate stays **source-reviewed** until the findings are resolved.

- 96 real frames captured; visual review completed with findings. Full accessibility checks and human studies are not finished yet.
- Passports rest on the sources; character and fitness are editorial hypotheses.
- Mass schematics do not replace rendered previews.
- Relations are editorial hypotheses; the visual review covers 12 concepts, not the whole corpus.
- The ten-style fixture tests the entry; it does not describe a participant's real taste.

Layout family, content composition and background motifs are separate traits. The passports keep the source composition markup and add an independent editorial interpretation. The production classifier and recommender are unchanged. The panorama's 820 style keys do not prove 820 unique concepts.

## Files and commands

- [Browser with schematics](index.html) — standalone HTML, open in a browser.
- [Catalog JSON](../../packages/taste-data/content/reference-catalog.v0.1.json) — the single source of passports, relations and scenarios.
- [JSON Schema](../../packages/taste-data/content/reference-catalog.schema.json) — the structure contract for editors.
- [Shared copy](../../packages/taste-data/content/reference-copy.v0.1.json) — fixture for the separate research renderer; it does not change the authored deck in magazine.

From the repository root:

```powershell
bun packages/taste-data/scripts/reference-catalog.ts --check
bun packages/taste-data/scripts/reference-catalog.ts --render
```

The first command checks semantic relations, keys, the single changed axis of each variant and the source SHA256 hashes. It is a specialized check, not a full JSON Schema validator. The second checks the catalog first, then updates this README and the browser. Edited sources need another review before the hashes are updated.

## Passports

### ref-c01 · Typographic manifesto

- Source: [t001-poster-mesh](../../packages/taste-screens/src/screens/t001-poster-mesh.svelte), deck 0.
- Family: **poster**. Content composition: **focal-mass**.
- Intent: Express one strong promise through text scale and a central focal point.
- Task: Quickly grasp the main claim and move to a single primary action.
- Focal point: A large central headline.

Central Stack: badge, text-8xl headline, lead and two buttons. The mesh fills the background without setting the reading order.

Media: An atmospheric mesh field behind the content; the background can change without rebuilding the central axis.

Relation to legacy: The primary tag matches the source markup; the mesh stays in the media layer.

**Invariants**

- Central axis and the order badge → title → lead → actions
- Large headline scale relative to the explanation
- The primary action and the secondary link are distinguishable

**Risks to check**

- A long headline can take up most of the frame
- The background must keep text contrast
- Radius shape has little effect on the overall structure

**Difference from ref-c04:** Both are centered, but here there is a large claim, an explanation and a pair of actions; ref-c04 deliberately uses a small headline and one action.

Authored key: `t001-poster-mesh|cosmic-night|montserrat+inter|12`.

- colour: `t001-poster-mesh|modern-minimal|montserrat+inter|12`. The palette changes; structure, media recipe, fonts and radius are kept.
- font: `t001-poster-mesh|cosmic-night|inter+inter|12`. Only the fonts axis changes; structure, media recipe, skin and radius are kept. Text wrapping may change.
- radius: `t001-poster-mesh|cosmic-night|montserrat+inter|8`. Only the radius changes; the effect depends on how components use rounded.

Template probes: classic, saas — planned; the source screen's composition is not guaranteed when tokens are carried over.

### ref-c02 · Two-column dialogue

- Source: [t002-split-glass](../../packages/taste-screens/src/screens/t002-split-glass.svelte), deck 1.
- Family: **split**. Content composition: **asymmetric-balance**.
- Intent: Pair an explanation with an expressive image in two equal parts.
- Task: Read the offer, look at the image and weigh the short proof points.
- Focal point: A large headline on the left tied to tall media on the right.

Grid cols=2: title, lead, two buttons and stats on the left; a tall glass-panel on the right. The bottom stats row sits inside the text column.

Media: A glass panel with overlapping rectangles and glow; this is composition inside the image.

Relation to legacy: The source L-arrangement has weak=true. Here the main principle is the balance of two parts; the source tag is kept separately.

**Invariants**

- Two large columns with independent roles
- Stats after the actions in the text column
- Media stays separate, not a text background

**Risks to check**

- The structure needs rethinking on a narrow screen
- Media width and height affect the balance
- Decorative glass does not explain the product's value

**Difference from ref-c12:** Ref-c02 uses dense two columns and stats; ref-c12 links small masses through open space and a diagonal.

Authored key: `t002-split-glass|violet-bloom|manrope+manrope|16`.

- colour: `t002-split-glass|modern-minimal|manrope+manrope|16`. The palette changes; structure, media recipe, fonts and radius are kept.
- font: `t002-split-glass|violet-bloom|inter+inter|16`. Only the fonts axis changes; structure, media recipe, skin and radius are kept. Text wrapping may change.
- radius: `t002-split-glass|violet-bloom|manrope+manrope|8`. Only the radius changes; the effect depends on how components use rounded.

Template probes: saas, classic — planned; the source screen's composition is not guaranteed when tokens are carried over.

### ref-c03 · Full-width poster

- Source: [t003-fullbleed-grain](../../packages/taste-screens/src/screens/t003-fullbleed-grain.svelte), deck 2.
- Family: **full-bleed**. Content composition: **edge-anchored**.
- Intent: Create a poster feel through a wide media band and an extremely large line.
- Task: Take in the expressive claim, then the explanation and the action at the bottom edge.
- Focal point: A large-scale headline under a wide grainy field.

Grain-band h-80 above a text-[168px] headline; below it, the lead on the left and the CTA on the right. Masses are stacked in horizontal layers.

Media: Grain is a standalone horizontal band; it is not a full-screen background.

Relation to legacy: The source L-arrangement is kept as legacy; the refined principle describes a top band and a bottom base.

**Invariants**

- Wide media above the typography
- Poster-scale title
- A bottom pairing of lead and CTA on opposite edges

**Risks to check**

- Long text changes the poster balance
- Loud typography does not suit every task
- The name full-bleed does not mean a full-screen background in this component

**Difference from ref-c07:** Here the horizontal bands are sequential; ref-c07 is organized into three editorial columns with a separate list.

Authored key: `t003-fullbleed-grain|neo-brutalism|rubik+rubik|0`.

- colour: `t003-fullbleed-grain|modern-minimal|rubik+rubik|0`. The palette changes; structure, media recipe, fonts and radius are kept.
- font: `t003-fullbleed-grain|neo-brutalism|inter+inter|0`. Only the fonts axis changes; structure, media recipe, skin and radius are kept. Text wrapping may change.
- radius: `t003-fullbleed-grain|neo-brutalism|rubik+rubik|8`. Only the radius changes; the effect depends on how components use rounded.

Template probes: portfolio, classic — planned; the source screen's composition is not guaranteed when tokens are carried over.

### ref-c04 · Quiet center

- Source: [t004-airy-dots](../../packages/taste-screens/src/screens/t004-airy-dots.svelte), deck 3.
- Family: **airy**. Content composition: **focal-mass**.
- Intent: Lower the visual pressure: a small message and one action inside a large open field.
- Task: Quickly grasp a short claim and pick the single next step.
- Focal point: A small central headline and a single action.

Central Stack with eyebrow, text-5xl title and an outline button. No lead and no second primary button.

Media: Dots fill the background; the corner motif is not carried into the content composition tag.

Relation to legacy: The source secondary=diagonal refers to the corner dots field. The content composition records a central focal point.

**Invariants**

- Large open field
- Small text scale relative to the frame
- One primary action

**Risks to check**

- A complex offer does not fit the short form
- Sparse information can feel empty
- Extra CTAs would break the original clarity

**Difference from ref-c12:** The quiet center is symmetric; the diagonal pause places text and image in different corners.

Authored key: `t004-airy-dots|modern-minimal|inter+inter|8`.

- colour: `t004-airy-dots|claude|inter+inter|8`. The palette changes; structure, media recipe, fonts and radius are kept.
- font: `t004-airy-dots|modern-minimal|manrope+manrope|8`. Only the fonts axis changes; structure, media recipe, skin and radius are kept. Text wrapping may change.
- radius: `t004-airy-dots|modern-minimal|inter+inter|4`. Only the radius changes; the effect depends on how components use rounded.

Template probes: classic, portfolio — planned; the source screen's composition is not guaranteed when tokens are carried over.

### ref-c05 · Claim and proof

- Source: [t005-stats-flat](../../packages/taste-screens/src/screens/t005-stats-flat.svelte), deck 4.
- Family: **stats**. Content composition: **rule-of-thirds**.
- Intent: Join the main claim to a readable band of numeric proof points.
- Task: Understand the offer and quickly assess a few key metrics.
- Focal point: A 2/3 text mass, then a separate row of metrics.

Grid cols=3: text col-span-2, a square Flat in the remaining third; below, a Separator and Grid cols=4 with stats.

Media: Flat shapes fill the right third; the geometry inside it is secondary to the ratio of the large parts.

Relation to legacy: Thirds are confirmed by col-span-2 in a three-column Grid. Stats are described separately from the composition tag.

**Invariants**

- A 2:1 ratio of the upper parts
- A separate bottom band of stats
- Metrics visually set apart from the hero

**Risks to check**

- The fixture repeats the first stat as the fourth, so these are not four different proof points
- Numbers need context and a source in a real product
- Extra metrics can overload the bottom

**Difference from ref-c10:** Here metrics sit in a separate band; in the bento, information is spread across cards within a shared grid.

Authored key: `t005-stats-flat|amber-minimal|golos-text+onest|4`.

- colour: `t005-stats-flat|modern-minimal|golos-text+onest|4`. The palette changes; structure, media recipe, fonts and radius are kept.
- font: `t005-stats-flat|amber-minimal|inter+inter|4`. Only the fonts axis changes; structure, media recipe, skin and radius are kept. Text wrapping may change.
- radius: `t005-stats-flat|amber-minimal|golos-text+onest|8`. Only the radius changes; the effect depends on how components use rounded.

Template probes: saas, dashboard — planned; the source screen's composition is not guaranteed when tokens are carried over.

### ref-c06 · Message and ribbon

- Source: [t006-ribbon-rings](../../packages/taste-screens/src/screens/t006-ribbon-rings.svelte), deck 5.
- Family: **ribbon**. Content composition: **focal-mass**.
- Intent: Support the central promise with a separate strip of repeated marks.
- Task: Read the offer and see the context or affiliation around it.
- Focal point: A central headline; the bottom ribbon is a supporting rhythm.

Central title, lead and actions in a Stack; the LogoRibbon follows the central block along the bottom edge.

Media: Rings sit behind the hero; the radial motif does not mean radial navigation.

Relation to legacy: The source radial refers to Rings; the refined content composition keeps focal-mass.

**Invariants**

- The central hero is separated from the bottom ribbon
- Repeated marks form a rhythm
- The ribbon does not compete with the primary action

**Risks to check**

- The source uses abstract icon slots, not real client logos
- A ribbon alone does not prove trust
- Background rings can add visual noise

**Difference from ref-c08:** The ribbon repeats small marks; ref-c08 shows one large object inside a frame.

Authored key: `t006-ribbon-rings|supabase|onest+inter|12`.

- colour: `t006-ribbon-rings|modern-minimal|onest+inter|12`. The palette changes; structure, media recipe, fonts and radius are kept.
- font: `t006-ribbon-rings|supabase|inter+inter|12`. Only the fonts axis changes; structure, media recipe, skin and radius are kept. Text wrapping may change.
- radius: `t006-ribbon-rings|supabase|onest+inter|8`. Only the radius changes; the effect depends on how components use rounded.

Template probes: saas, classic — planned; the source screen's composition is not guaranteed when tokens are carried over.

### ref-c07 · Editorial spread

- Source: [t007-editorial-duotone](../../packages/taste-screens/src/screens/t007-editorial-duotone.svelte), deck 6.
- Family: **editorial**. Content composition: **editorial-columns**.
- Intent: Offer several entry points into the content through typographic hierarchy, numbers and a separate image.
- Task: Scan the topics, read the main piece and choose the next action.
- Focal point: A large headline in the middle column, supported by neighboring pieces.

12-column Grid: items col-span-3, headline/lead/action col-span-5, Duotone col-span-4. The central text is bottom-aligned.

Media: A tall Duotone v=1 is a procedural landscape, separate from the list and the text.

Relation to legacy: The source rule-of-thirds is an approximation. Here the confirmed 3:5:4 proportions and editorial columns are recorded.

**Invariants**

- Three 3:5:4 columns with different roles
- A numbered list of standalone entry points
- A rule after the masthead and a bottom base for the main text

**Risks to check**

- A complex spread needs a clear order on a narrow screen
- A visually large headline should not hide the meaning of the list
- 3:5:4 should not be treated as exact thirds

**Difference from ref-c03:** Each column has a different role; ref-c03 builds one vertical poster story.

Authored key: `t007-editorial-duotone|claude|ibm-plex-sans+ibm-plex-sans|0`.

- colour: `t007-editorial-duotone|modern-minimal|ibm-plex-sans+ibm-plex-sans|0`. The palette changes; structure, media recipe, fonts and radius are kept.
- font: `t007-editorial-duotone|claude|inter+inter|0`. Only the fonts axis changes; structure, media recipe, skin and radius are kept. Text wrapping may change.
- radius: `t007-editorial-duotone|claude|ibm-plex-sans+ibm-plex-sans|8`. Only the radius changes; the effect depends on how components use rounded.

Template probes: blog, three-column — planned; the source screen's composition is not guaranteed when tokens are carried over.

### ref-c08 · Windowed demo

- Source: [t008-frame-conic](../../packages/taste-screens/src/screens/t008-frame-conic.svelte), deck 7.
- Family: **frame**. Content composition: **pyramid**.
- Intent: Explain the offer and give a concrete image of the result in a large frame.
- Task: Link the promise to the demo and move to action.
- Focal point: A top headline paired with a large demo window.

A narrow centered title/lead/actions on top, a wide browser-like Card below; inside are a Conic and a central Card.

Media: The Conic stays inside the browser-like frame; a small nested specimen is a separate focal point.

Relation to legacy: The primary pyramid is kept; radial describes the Conic inside the window, not the overall page structure.

**Invariants**

- The headline is narrower than the window
- The frame separates the demo from the main interface
- Nested content reads as a sample

**Risks to check**

- Demo buttons can be mistaken for working ones
- The inner window adds density and complexity
- The outer shadow belongs to the floating surface, not to every element

**Difference from ref-c11:** Ref-c08 clearly separates the interface from the nested demo; ref-c11 makes the grid the page itself.

Authored key: `t008-frame-conic|bubblegum|nunito+nunito|16`.

- colour: `t008-frame-conic|modern-minimal|nunito+nunito|16`. The palette changes; structure, media recipe, fonts and radius are kept.
- font: `t008-frame-conic|bubblegum|inter+inter|16`. Only the fonts axis changes; structure, media recipe, skin and radius are kept. Text wrapping may change.
- radius: `t008-frame-conic|bubblegum|nunito+nunito|8`. Only the radius changes; the effect depends on how components use rounded.

Template probes: saas, docs — planned; the source screen's composition is not guaranteed when tokens are carried over.

### ref-c09 · Input between frames

- Source: [t070-prompt-geometric](../../packages/taste-screens/src/screens/t070-prompt-geometric.svelte), deck 33.
- Family: **prompt**. Content composition: **focal-mass**.
- Intent: Make the input the main center of action while keeping an expressive geometric frame.
- Task: Understand what to enter, type a query and choose an action.
- Focal point: An explanation paired with an input field in the central column.

Two Geometric bands at the edges; the mx-60 middle column holds title, lead, Input+Button and TopicChips.

Media: The geometric edges act as frames around the work area.

Relation to legacy: The primary focal-mass is kept; the side geometric bands count as media. t009, removed from the panorama, is not used.

**Invariants**

- Content stays in the open middle zone
- The input field and its action sit side by side
- TopicChips support the input without replacing it

**Risks to check**

- In the source the Input has a placeholder; no separate label is visible
- The example shows the form but does not implement query handling
- Wide side bands shrink the work area

**Difference from ref-c04:** Both use the center, but here there is input and topic choice; ref-c04 offers one next step without input.

Authored key: `t070-prompt-geometric|violet-bloom|manrope+ibm-plex-sans|4`.

- colour: `t070-prompt-geometric|modern-minimal|manrope+ibm-plex-sans|4`. The palette changes; structure, media recipe, fonts and radius are kept.
- font: `t070-prompt-geometric|violet-bloom|inter+inter|4`. Only the fonts axis changes; structure, media recipe, skin and radius are kept. Text wrapping may change.
- radius: `t070-prompt-geometric|violet-bloom|manrope+ibm-plex-sans|8`. Only the radius changes; the effect depends on how components use rounded.

Template probes: classic, docs — planned; the source screen's composition is not guaranteed when tokens are carried over.

### ref-c10 · Hierarchical bento

- Source: [t010-dense-geometric](../../packages/taste-screens/src/screens/t010-dense-geometric.svelte), deck 9.
- Family: **dense-grid**. Content composition: **modular-hierarchy**.
- Intent: Gather varied content into a shared grid with two large areas and a small bottom row.
- Task: Take in the main claim and quickly scan the supporting metrics.
- Focal point: A large text block on the left; media of equal area on the right.

Grid cols=4, rows=3: hero col-span-2 row-span-2 and a Geometric of the same area; the bottom row has three stats and an info Card.

Media: Geometric is a large standalone grid area, not the layout of all blocks.

Relation to legacy: The source rule-of-thirds refers to two of three rows vertically. The catalog uses the more precise modular-hierarchy and notes the 1:1 upper masses.

**Invariants**

- Large upper areas are separated from small bottom cards
- All elements snap to the shared grid
- Cell size signals relative importance

**Risks to check**

- The upper areas split the width in half, not in thirds
- Equal hero and media size can create competing focal points
- More cards shift the priorities

**Difference from ref-c11:** Here there are two large masses and a small bottom row; ref-c11 has nine cells with the focal point in the center.

Authored key: `t010-dense-geometric|kodama-grove|montserrat+open-sans|8`.

- colour: `t010-dense-geometric|modern-minimal|montserrat+open-sans|8`. The palette changes; structure, media recipe, fonts and radius are kept.
- font: `t010-dense-geometric|kodama-grove|inter+inter|8`. Only the fonts axis changes; structure, media recipe, skin and radius are kept. Text wrapping may change.
- radius: `t010-dense-geometric|kodama-grove|montserrat+open-sans|4`. Only the radius changes; the effect depends on how components use rounded.

Template probes: dashboard, portfolio — planned; the source screen's composition is not guaranteed when tokens are carried over.

### ref-c11 · Center and surroundings

- Source: [t044-dense-conic](../../packages/taste-screens/src/screens/t044-dense-conic.svelte), deck 31.
- Family: **dense-grid**. Content composition: **cross**.
- Intent: Organize a rich field around a central message, using the surroundings as support.
- Task: First find the main claim, then explore the neighboring blocks.
- Focal point: An accented central cell, supported by vertical and horizontal axes.

Grid cols=3, rows=3: a central primary Card with title/action, stats above/below, text left/right, Conic in the four corners.

Media: Four Conic fields sit in the corners; the radial motif of each does not make the whole grid radial.

Relation to legacy: The source cross is confirmed by the central title and four edge cells; Conic is moved to media.

**Invariants**

- The main cell stays in the center
- Four orthogonal neighbors support the center
- Corner media does not compete with the message

**Risks to check**

- Bright corners can pull attention away from the center
- A long title must fit the small central card
- The grid needs its own reading order on a narrow screen

**Difference from ref-c10:** The difference lies in geometry and priority: a central cell instead of a large side hero.

Authored key: `t044-dense-conic|modern-minimal|rubik+rubik|8`.

- colour: `t044-dense-conic|claude|rubik+rubik|8`. The palette changes; structure, media recipe, fonts and radius are kept.
- font: `t044-dense-conic|modern-minimal|inter+inter|8`. Only the fonts axis changes; structure, media recipe, skin and radius are kept. Text wrapping may change.
- radius: `t044-dense-conic|modern-minimal|rubik+rubik|4`. Only the radius changes; the effect depends on how components use rounded.

Template probes: dashboard, portfolio — planned; the source screen's composition is not guaranteed when tokens are carried over.

### ref-c12 · Diagonal pause

- Source: [t065-airy-duotone](../../packages/taste-screens/src/screens/t065-airy-duotone.svelte), deck 8.
- Family: **airy**. Content composition: **diagonal**.
- Intent: Create calm tension between small text at the start and a separate image in the opposite corner.
- Task: Read a short message and look at the image while keeping a sense of open space.
- Focal point: The relation between the upper text mass and the lower-right image.

Title/c.accent/Button in a Stack at the top start; Duotone size-80 as an absolute block at right-16 bottom-16.

Media: A small Duotone v=0 uses a placeholder MediaFrame; the frame shape alone does not define the diagonal.

Relation to legacy: The primary diagonal is confirmed by block placement, not by the image's tilt or color.

**Invariants**

- Text and image occupy different corners
- A large open field between the masses
- Text stays small relative to the screen

**Risks to check**

- The image's absolute position can overlap long text
- The c.accent value is not a full lead
- The composition should not make the user hunt for the button

**Difference from ref-c04:** Both are airy, but the symmetric center is replaced by a diagonal link between two masses.

Authored key: `t065-airy-duotone|kodama-grove|montserrat+inter|8`.

- colour: `t065-airy-duotone|modern-minimal|montserrat+inter|8`. The palette changes; structure, media recipe, fonts and radius are kept.
- font: `t065-airy-duotone|kodama-grove|inter+inter|8`. Only the fonts axis changes; structure, media recipe, skin and radius are kept. Text wrapping may change.
- radius: `t065-airy-duotone|kodama-grove|montserrat+inter|4`. Only the radius changes; the effect depends on how components use rounded.

Template probes: portfolio, two-column — planned; the source screen's composition is not guaranteed when tokens are carried over.

## Relations

The types have no numeric ranking and do not claim user fitness. task-counterexample helps tell visual similarity apart from a shared task.

- **ref-r01: ref-c01 ↔ ref-c04** (same-principle). Suited to comparing two ways of a central message; a shared center does not make them duplicates. Compare as a structural/task relation. A color match is not claimed.
- **ref-r02: ref-c01 ↔ ref-c06** (same-principle). The ribbon adds a separate rhythm to the central message. Compare as a structural/task relation. A color match is not claimed.
- **ref-r03: ref-c01 ↔ ref-c09** (task-counterexample). A similar center does not mean interchangeability: a button action and a query input need different scenarios. Compare as a structural/task relation. A color match is not claimed.
- **ref-r04: ref-c02 ↔ ref-c05** (structural-neighbor). Two columns turn into an explicit 2:1 and a separate bottom band. Compare as a structural/task relation. A color match is not claimed.
- **ref-r05: ref-c02 ↔ ref-c12** (expressive-neighbor). A similar split of roles, but the dense column structure gives way to an open diagonal. Compare as a structural/task relation. A color match is not claimed.
- **ref-r06: ref-c03 ↔ ref-c07** (expressive-neighbor). The poster and the spread organize large text and image differently. Compare as a structural/task relation. A color match is not claimed.
- **ref-r07: ref-c04 ↔ ref-c12** (same-layout-family). Control pair: a shared layout family does not guarantee the same composition. Compare as a structural/task relation. A color match is not claimed.
- **ref-r08: ref-c05 ↔ ref-c10** (structural-neighbor). Metrics can be a standalone band or small cells of a shared grid. Compare as a structural/task relation. A color match is not claimed.
- **ref-r09: ref-c06 ↔ ref-c08** (expressive-neighbor). A ribbon of small marks and one large window are different kinds of support for a promise; trust is not confirmed. Compare as a structural/task relation. A color match is not claimed.
- **ref-r10: ref-c07 ↔ ref-c12** (expressive-neighbor). The editorial spread and the sparse message differ in amount of content. Compare as a structural/task relation. A color match is not claimed.
- **ref-r11: ref-c08 ↔ ref-c11** (expressive-neighbor). A center inside a demo window differs from the center of the page itself. Compare as a structural/task relation. A color match is not claimed.
- **ref-r12: ref-c10 ↔ ref-c11** (same-layout-family). Control pair: two large areas versus a central cell in a 3×3 grid. Compare as a structural/task relation. A color match is not claimed.
- **ref-r13: ref-c04 ↔ ref-c09** (task-counterexample). A minimal message with one CTA does not replace an input interface. Compare as a structural/task relation. A color match is not claimed.
- **ref-r14: ref-c06 ↔ ref-c09** (task-counterexample). LogoRibbon and TopicChips repeat visually but serve different roles. Compare as a structural/task relation. A color match is not claimed.
- **ref-r15: ref-c02 ↔ ref-c03** (expressive-neighbor). Having both media and text does not mean the layouts match. Compare as a structural/task relation. A color match is not claimed.
- **ref-r16: ref-c05 ↔ ref-c07** (task-counterexample). Scanning metrics and reading an editorial list need different UX assessments. Compare as a structural/task relation. A color match is not claimed.
- **ref-r17: ref-c08 ↔ ref-c09** (task-counterexample). The nested specimen is a demo; the input field belongs to the page's primary action. Compare as a structural/task relation. A color match is not claimed.
- **ref-r18: ref-c10 ↔ ref-c09** (task-counterexample). The same recipe=geometric does not mean a similar interface. Compare as a structural/task relation. A color match is not claimed.
- **ref-r19: ref-c03 ↔ ref-c01** (expressive-neighbor). Different compositions can support the same expressive intent. Compare as a structural/task relation. A color match is not claimed.
- **ref-r20: ref-c11 ↔ ref-c09** (task-counterexample). A similar central focus does not prove the same user task. Compare as a structural/task relation. A color match is not claimed.

## Measurement scenarios

### REF-B1 · Choose a direction

Start: A set of recommendations is open.

Outcome: The participant picks a conceptId and explains how it relates to their task.

Full specification:

```json
{
  "id": "REF-B1",
  "title": "Choose a direction",
  "mode": "human",
  "start": "A set of recommendations is open.",
  "outcome": "The participant picks a conceptId and explains how it relates to their task.",
  "candidateConcepts": [
    "ref-c01",
    "ref-c02",
    "ref-c03",
    "ref-c04",
    "ref-c05",
    "ref-c06",
    "ref-c07",
    "ref-c08",
    "ref-c09",
    "ref-c10",
    "ref-c11",
    "ref-c12"
  ],
  "automation": "Do not judge fitness automatically."
}
```

### REF-B2 · Change typography, keep the structure

Start: ref-c02 is open in its source style.

Outcome: ref-c02:font is selected; screen, skin and radius match the source.

Full specification:

```json
{
  "id": "REF-B2",
  "title": "Change typography, keep the structure",
  "mode": "human",
  "start": "ref-c02 is open in its source style.",
  "outcome": "ref-c02:font is selected; screen, skin and radius match the source.",
  "expectedVariantId": "ref-c02:font",
  "automation": "State check only; the participant confirms understanding of the differences."
}
```

### REF-B3 · Tell apart compositions of one family

Start: ref-c10 and ref-c11 are compared.

Outcome: The participant distinguishes a large side focal point from a central cell.

Full specification:

```json
{
  "id": "REF-B3",
  "title": "Tell apart compositions of one family",
  "mode": "human",
  "start": "ref-c10 and ref-c11 are compared.",
  "outcome": "The participant distinguishes a large side focal point from a central cell.",
  "candidateConcepts": [
    "ref-c10",
    "ref-c11"
  ],
  "relationId": "ref-r12",
  "automation": "Do not judge the explanation by a single legacy tag match."
}
```

### REF-B4 · Test tokens on a template

Start: ref-c07 is open.

Outcome: blog is open; the participant judges token fitness and understands that the template layout is separate.

Full specification:

```json
{
  "id": "REF-B4",
  "title": "Test tokens on a template",
  "mode": "human",
  "start": "ref-c07 is open.",
  "outcome": "blog is open; the participant judges token fitness and understands that the template layout is separate.",
  "candidateConcepts": [
    "ref-c07"
  ],
  "templateId": "blog",
  "automation": "A template preview does not confirm the source composition carries over."
}
```

### REF-B5 · Save and get the right variant

Start: ref-c05:radius is open.

Outcome: The collection and the successfully copied preset match the expected style key.

Full specification:

```json
{
  "id": "REF-B5",
  "title": "Save and get the right variant",
  "mode": "human",
  "start": "ref-c05:radius is open.",
  "outcome": "The collection and the successfully copied preset match the expected style key.",
  "expectedVariantId": "ref-c05:radius",
  "automation": "Clipboard success does not prove the preset is integrated into a project."
}
```

## Real previews and research

- [Comparison of 96 frames](visual-review.html).
- [Visual findings](visual-review.md).
- [Protocol for designers and art directors](research-protocol.md).
- [Conditions and observations](capture-results.json).

Capture and the separate renderer are already implemented. Commands: start magazine dev, then `node packages/taste-data/scripts/reference-capture.mjs --variants` and `node packages/taste-data/scripts/reference-review.mjs`. PNGs stay local in the ignored captures/.

## Criteria for the next gate

1. Repeat the capture after changes: desktop 1440 × 1080 and a diagnostic narrow frame 390 × 844; the latter is not a production mobile layout. Check keyboard, text contrast, long text, wrapping and clipping. Record viewport, theme, key, revision and result.
2. Use the implemented separate renderer with a shared deck that leaves authored content unchanged. For comparisons apply the normalized styles from the JSON: modern-minimal, inter/inter, radius 8, light. Compare with the authored versions.
3. Run a visual similarity review; merge duplicates by structure and task. A different name, color or radius does not prove a new concept.
4. Run the human scenarios REF-B1–B5; record outcome, explanation, time, backtracking and errors. Set the timing start and completion criterion in advance; exclude hidden-tab periods. Distinguish abandonment from failure and from an unfinished session.
5. Refine the passports based on the results, and only then connect the UX harness and grow the catalog. Do not count a successful preset copy as using it in a project.

## Entry fixture

Exactly ten valid picks; they serve as a deterministic entry, not a taste profile. The URL from `fixtures.entry.route` will replace the locally saved magazine picks. Use a separate browser profile. Whether specific styles belong to the current panorama wall is not yet measured.

## Reproducibility

Review source: `8efbb7e81376eb7704a43288bca63212bc2b97cd`. SHA256 hashes are stored for the shared index files and for each component. The document and HTML are generated from the JSON and are not wired into the production runtime.
