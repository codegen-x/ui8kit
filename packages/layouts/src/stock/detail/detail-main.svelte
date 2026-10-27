<!-- The detail page of a block variant or a screen page, as on the stock sites: a head of two columns (about 70/30: the live preview
     of fixed proportions, the key information and actions), a body in the same widths (the concepts and entities of the asset, its
     passport), then the related rows; one column on a phone. The full-screen preview (device and mode) is a dialog the URL opens. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { Block, Box, Link, LucideIcon, Stack, Text } from "@codegen-x/svelte-compose";
  import Concepts from "./concepts.svelte";
  import Fullscreen from "./fullscreen.svelte";
  import Passport from "./passport.svelte";
  import PreviewPanel from "./preview-panel.svelte";
  import RelatedRow from "./related-row.svelte";
  import Summary from "./summary.svelte";
  import type { CardView, DetailView, DeviceView, PassportLink, RelatedView, StockText } from "../text";

  let { t, view, back, devices, full, onfull, mode, onmode, src, related, card, thumb }: {
    t: StockText; view: DetailView; back: string; devices: readonly DeviceView[];
    /** the device of the open full-screen preview (null: closed); `onfull` opens it at a device or closes it (null) */
    full: DeviceView | null; onfull: (device: string | null) => void;
    mode: string; onmode: (mode: string) => void; src: string; related: RelatedView[];
    card: Snippet<[CardView]>; thumb: Snippet<[PassportLink]>;
  } = $props();
  const screen = $derived(view.type === "screen");
  // the part of the page the concepts column points at (a screen page's block), outlined in the preview
  let point = $state<number | null>(null);
  function locate(i: number): void {
    document.getElementById("detail-head")?.scrollIntoView({ behavior: "smooth", block: "start" });
    point = i;
  }
</script>

<Block tag="main" id="main-content" aria-labelledby="detail-title" class="ui8-detail" data-testid="detail" data-asset={view.key}>
  <Stack gap="6" align="stretch">
    <Link href={back} size="sm" variant="muted" class="ui8-detail-back" data-testid="detail-back"><LucideIcon name="arrow-left" size={16} /><Text tag="span">{t.detail.back}</Text></Link>
    <Box id="detail-head" class="ui8-detail-split" data-testid="detail-head">
      <PreviewPanel {t} title={view.title} device={devices[0]!} {src} parts={screen ? view.map.length : 0} {point} onfull={() => onfull(devices[0]!.id)} />
      <Summary {t} {view} onfull={() => onfull(devices[0]!.id)} />
    </Box>
    <Box class="ui8-detail-split ui8-detail-body" data-testid="detail-body">
      <Concepts {t} {view} {point} onpoint={(i) => (point = i)} onlocate={locate} {thumb} />
      <Passport {t} {view} />
    </Box>
    {#each related as row (row.id)}
      <Box class="ui8-detail-related"><RelatedRow {t} {row} {card} /></Box>
    {/each}
  </Stack>
  <Fullscreen {t} title={view.title} {devices} device={full} ondevice={(d) => onfull(d)} {mode} {onmode} {src} onclose={() => onfull(null)} />
</Block>
