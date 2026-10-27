<!-- The detail page of a block variant or a screen page: the way back, the name, the live preview in a device frame (width and
     mode), the passport (blocks or variants, the screen pages, the labels) and the similar assets. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { Badge, Block, Group, Link, LucideIcon, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import DevicePreview from "./device-preview.svelte";
  import Passport from "./passport.svelte";
  import SimilarRow from "./similar-row.svelte";
  import type { CardView, DetailView, DeviceView, StockText } from "../text";

  let { t, view, back, devices, device, ondevice, mode, onmode, src, similar, card }: {
    t: StockText; view: DetailView; back: string; devices: readonly DeviceView[]; device: DeviceView; ondevice: (id: string) => void;
    mode: string; onmode: (mode: string) => void; src: string; similar: CardView[]; card: Snippet<[CardView]>;
  } = $props();
</script>

<Block tag="main" id="main-content" aria-labelledby="detail-title" class="ui8-detail" data-testid="detail" data-asset={view.key}>
  <Stack gap="8" align="stretch">
    <Stack gap="2" align="start">
      <Link href={back} size="sm" variant="muted" data-testid="detail-back"><LucideIcon name="arrow-left" size={16} /><Text tag="span">{t.detail.back}</Text></Link>
      <Group gap="4" align="center" class="ui8-detail-head">
        <Title as={1} size="2xl" weight="bold" id="detail-title" class="ui8-detail-title">{view.title}</Title>
        <Badge variant="secondary">{view.kind}</Badge>
      </Group>
      <Text tag="p" class="ui8-detail-subtitle">{view.subtitle}</Text>
    </Stack>
    <DevicePreview {t} title={view.title} {devices} {device} {ondevice} {mode} {onmode} {src} />
    <Passport {t} {view} />
    <SimilarRow {t} cards={similar} {card} />
  </Stack>
</Block>
