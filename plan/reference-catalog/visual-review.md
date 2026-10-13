# Visual review of the reference catalog

Status: **reviewed-with-findings**. Open the [real previews](visual-review.html).
96 frames: 12 concepts × 8 conditions. The review covers only the reference
dozen. Date/browser/revision and fingerprints are recorded in
[capture-results.json](capture-results.json), the exact input catalog in
[capture-input.catalog.json](capture-input.catalog.json).

## Conditions

- Authored desktop: real components with their original palette, fonts, radius and copy.
- Normalized desktop: modern-minimal, Inter/Inter, radius 8, shared deck.
- Authored narrow and normalized narrow: the .taste-frame width is changed to 390,
  height 844. This is a diagnostic reflow, not a production mobile layout.
- Long narrow: shared deck with a long title, explanation and CTA.
- Colour/font/radius desktop: three single-axis variants per concept.
- Light, DPR 1, reduced motion, local fonts. Before the screenshot the scroll
  the browser triggers during Tab traversal is reset. This keeps the original frame.

In the production magazine, Overview shows the desktop frame via scale.
Support for a responsive page cannot be inferred from that downscaling.
PNGs live in the ignored `captures/` and are reproduced by the capture script.

## Observations per concept

### ref-c01 — Typographic manifesto

On desktop the central dominant survives shared copy and tokens.
In the narrow frame the authored title fits, but the navigation collides.
Long copy and the pair of actions spill beyond the first screen.
Keep the concept; define mobile navigation and the copy length range separately.

### ref-c02 — Two-column dialogue

On desktop text and media are clearly distinct; stats sit in the text column.
At 390 px the fixed-padding columns squeeze the text; media overlaps
it and the controls. A sequential mobile composition is needed, with the order of
text, actions, proof and media defined up front.

### ref-c03 — Full-width poster

Large typography under a media band keeps an independent structure.
The fixed monumental title size does not fit the narrow frame.
Keep as a desktop poster; the mobile version needs a different text scale
and control over media height.

### ref-c04 — Quiet center

A small central claim and a single action set it apart from ref-c01. The circle and dots
genuinely take part in the composition and partly cross the message area.
Body text reads on narrow, but the brand, navigation and header action
overlap. Zero bounds flags do not prove the absence of overlaps.

### ref-c05 — Claim and proof

On desktop the split top and the separate stats band survive. The fourth
metric repeats the first: the source has three data points, the template renders four.
On narrow the media shrinks, four metrics get cramped, and long copy
does not fit. A real project needs correct data and a mobile order for the evidence.

### ref-c06 — Message and ribbon

The central mass is close to ref-c01; the separate ribbon adds a layer of information.
Abstract icons are not evidence of client trust.
On narrow the title, navigation and ribbon are clipped or leave their areas.
Treat as part of the focal family; justify the ribbon with real content.
Hidden accessibility labels are excluded from the visible overflow flags.

### ref-c07 — Editorial spread

The editorial order and the low central text mass stay distinguishable even
with the shared deck. On narrow the three columns squeeze the text, and the title and media
conflict. Define the reading sequence first, then the mobile
placement; mechanically shrinking the grid does not preserve the editorial hierarchy.

### ref-c08 — Windowed demo

A claim above a wide browser-like stage keeps the frame composition.
On narrow the outer authored copy mostly reads, but the content of the
inner specimen is clipped and the navigation overlaps.
Separate requirements for a product illustration from those for a functional interface.

### ref-c09 — Input between frames

The input field distinguishes the task from a central hero with a CTA. Geometric rails
frame the edges, but on narrow they take too much space and conflict
with the content. The input has no explicit label/ARIA name; a placeholder alone does not replace
a persistent field label. Before functional use it needs a label
and a behaviour strategy for the decorative rails.

### ref-c10 — Hierarchical bento

Two large top masses and the lower cells set it apart from ref-c11.
On narrow four columns and row spans turn the content into cramped strips,
with overlaps and clipping. Define card priorities and order on mobile.

### ref-c11 — Center and surroundings

The central cell and the surrounding metrics/media keep an independent
hierarchy on desktop. On narrow the three-column cross squeezes text and actions.
The mobile placement should preserve the meaning of the central message,
not every desktop coordinate.

### ref-c12 — Diagonal pause

Text top-left and media bottom-right give a clear diagonal on desktop.
On narrow the absolutely positioned media covers part of the CTA; long
copy amplifies the conflict. This is visible in the screenshot even with zero
bounds overflow. On mobile the media should join the flow or have
a reserved area.

## Duplicate check

No obvious full duplicates were found in this dozen with the shared deck/tokens.
This is an editorial conclusion about the chosen screens, not proof of the uniqueness of
146 screen definitions or the 820 panorama keys.

- ref-c01/ref-c04/ref-c06 — a close focal family: scale, supporting copy,
  number of actions and the bottom ribbon change the task and delivery. Do not count them
  as three independent compositional principles.
- ref-c10/ref-c11 — one dense-grid family, different dominant and reading order.
- ref-c02/ref-c05 — related split, but a different role and placement of proof.
- ref-c09 — input/confirmation, not just another central CTA composition.

To grow the catalog, a new concept needs a difference in structure or task,
described in its passport. A token change remains a variant.

## Accessibility and measurements

On the 24 authored/normalized desktop frames, visible text and controls stay
within the frame bounds; there are no runtime errors and the selected fonts are loaded.
Tab traversal and CSS focus are preserved. This is not a full accessibility check:
internal overlaps, low distinguishability, meaning and behaviour need a separate review.

Contrast was checked for control text that has its own opaque solid
background: 58 measured pairs are above the relevant threshold; another 76 cases were not assessed
by this method because of a transparent/undetermined background. The basis is the minimum
contrast of 4.5:1 for normal text and 3:1 for large text.
[W3C method](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

Data: [contrast-results.json](contrast-results.json). Conversion via the browser
canvas yields 8-bit sRGB; values near the threshold need a more precise check.
Procedural media, transparent backgrounds, dark theme and interactive states
are not covered by this check. "Above the threshold" for a colour pair does not mean a WCAG pass for the whole page.

## Next gate

1. Approve rules for the mobile presentation: a scaled showcase and a responsive
   page have different requirements; confirm accessibility of a finished mobile preset separately.
2. Fix labels for functional prompt examples, overlaps and clipped controls
   in the adaptations. Then repeat the capture.
3. Check all text over media, dark/theme and normal-motion states.
4. Run [REF-B1–B5 with designers and art directors](research-protocol.md).
   There are no participant results yet; the [session form](research-session.template.json) is empty.

The research renderer and scenarios are ready. Production UI and screen
components were not reworked by this review.
