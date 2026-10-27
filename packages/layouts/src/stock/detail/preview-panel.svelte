<!-- The live preview of the detail page: a stage of fixed proportions (16:10, the height follows the width only) holding the device
     frame at desktop width, scaled as a whole (src/preview/device.ts), and the button that opens the full-screen preview (under the
     stage below lg, so it never covers the small preview; over its corner from lg up). `point`
     is the part of the page the concepts column points at (outlined in the frame). -->
<script lang="ts">
  import { Block, Box, Button, LucideIcon, Text } from "@codegen-x/svelte-compose";
  import { mountDevice, type DeviceFrame } from "../../preview/device";
  import { fmt, type DeviceView, type StockText } from "../text";

  let { t, title, device, src, parts, point, onfull }: {
    t: StockText; title: string; device: DeviceView; src: string; parts: number; point: number | null; onfull: () => void;
  } = $props();
  const name = $derived(fmt(t.detail.preview.frame, { title }));

  let frame: DeviceFrame | null = null;
  $effect(() => {
    const host = document.getElementById("detail-device");
    if (!host) return;
    frame = mountDevice(host, src, name, device, "contain", parts);
    return () => { frame?.destroy(); frame = null; };
  });
  $effect(() => { frame?.name(name); });
  $effect(() => { frame?.highlight(point); });
</script>

<Block tag="section" aria-label={t.detail.preview.title} class="ui8-detail-preview" data-testid="detail-preview">
  <Box class="ui8-detail-stage" data-testid="detail-stage">
    <Box id="detail-device" class="ui8-device" data-device={device.id} data-testid="device-frame"></Box>
  </Box>
  <Button variant="secondary" size="sm" class="ui8-detail-full" onclick={onfull} data-testid="detail-full">
    <LucideIcon name="monitor-smartphone" size={16} />
    <Text tag="span">{t.detail.preview.full}</Text>
  </Button>
</Block>
