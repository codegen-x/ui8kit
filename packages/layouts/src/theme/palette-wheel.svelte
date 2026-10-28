<!-- The colour wheel of the palette panel (as in online palette editors): hue round the disc (0 at the top, clockwise), saturation
     from the grey centre out to the rim, lightness on the outer ring. Pressing and dragging on the disc moves the nearest marker
     (any marker: the whole harmony turns with it, so its angles hold); on the ring it sets the lightness. The markers are the
     harmony's colours, the base one larger. Pointer only: the panel's range inputs are the keyboard and screen reader controls. -->
<script lang="ts">
  import { Box } from "@codegen-x/svelte-compose";
  import { baseHueFor, css, harmonyColours, hueAt, wheelPoint, type Palette } from "@ui8kit/theme-model/palette";

  let { palette, onchange, label }: { palette: Palette; onchange: (p: Palette) => void; label: string } = $props();
  const marks = $derived(harmonyColours(palette));
  const STOPS = Array.from({ length: 13 }, (_, i) => i * 30);
  const disc = $derived(`background:radial-gradient(circle closest-side,${css({ h: 0, s: 0, l: palette.l })},transparent),conic-gradient(${STOPS.map((h) => css({ h, s: 100, l: palette.l })).join(",")})`);
  const ring = $derived(`background:conic-gradient(${[0, 25, 50, 75, 100].map((l) => css({ h: palette.h, s: palette.s, l })).join(",")})`);
  // the disc is 80% of the wheel's width; the ring is the rest (radius 1.05 to 1.25 in the disc's units)
  const DISC = 0.8;
  const at = (x: number, y: number): string => `left:${50 + x * 50 * DISC}%;top:${50 + y * 50 * DISC}%`;
  // a marker: its colour in a ring of the page background and a hairline of the text colour (one gradient: the marker is clipped round)
  const dot = (c: string): string => `background:radial-gradient(circle closest-side,${c} 58%,var(--background) 62% 82%,var(--foreground) 86%)`;
  const markStyle = (i: number): string => { const c = marks[i]!, p = wheelPoint(c.h, c.s); return `${at(p.x, p.y)};${dot(css(c))}`; };
  const ringMark = $derived.by(() => { const a = (palette.l / 100) * 2 * Math.PI; return `${at(Math.sin(a) * 1.15, -Math.cos(a) * 1.15)};${dot(css({ h: palette.h, s: palette.s, l: palette.l }))}`; });

  let drag: { el: HTMLElement; kind: "disc" | "ring"; i: number } | null = null;
  function point(e: PointerEvent, el: HTMLElement): { dx: number; dy: number; r: number } {
    const b = el.getBoundingClientRect(), dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2);
    const u = (b.width / 2) * DISC;
    return { dx: dx / u, dy: dy / u, r: Math.hypot(dx, dy) / u };
  }
  function move(e: PointerEvent): void {
    if (!drag) return;
    const { dx, dy, r } = point(e, drag.el);
    if (drag.kind === "ring") { onchange({ ...palette, l: Math.round((((Math.atan2(dx, -dy) / (2 * Math.PI)) + 1) % 1) * 100) }); return; }
    onchange({ ...palette, h: baseHueFor(palette, drag.i, hueAt(dx, dy)), s: Math.round(Math.min(1, r) * 100) });
  }
  function down(e: PointerEvent): void {
    const el = e.currentTarget as HTMLElement;
    const { dx, dy, r } = point(e, el);
    if (r > 1.3) return;
    let i = 0;
    if (r <= 1) {
      // the marker nearest to the press: dragging it turns the harmony around the centre
      let best = Infinity;
      marks.forEach((c, k) => { const p = wheelPoint(c.h, c.s), d = Math.hypot(p.x - dx, p.y - dy); if (d < best) { best = d; i = k; } });
      if (best > 0.2) i = 0;
    }
    drag = { el, kind: r > 1 ? "ring" : "disc", i };
    el.setPointerCapture(e.pointerId);
    move(e);
  }
  const up = (): void => { drag = null; };
</script>

<Box class="ui8-palette-wheel" role="img" aria-label={label} onpointerdown={down} onpointermove={move} onpointerup={up} onpointercancel={up} data-testid="palette-wheel">
  <Box class="ui8-palette-ring" style={ring}></Box>
  <Box class="ui8-palette-gap"></Box>
  <Box class="ui8-palette-disc" style={disc}></Box>
  {#each marks as _, i (i)}
    <Box class={i === 0 ? "ui8-palette-mark ui8-palette-mark-base" : "ui8-palette-mark"} style={markStyle(i)} data-testid={"palette-mark-" + i}></Box>
  {/each}
  <Box class="ui8-palette-mark" style={ringMark} data-testid="palette-mark-ring"></Box>
</Box>
