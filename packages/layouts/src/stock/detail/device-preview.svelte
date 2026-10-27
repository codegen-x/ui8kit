<!-- The live preview of the detail page: the width (desktop, tablet, phone) and the light/dark mode as two radio groups styled as
     segments, then the device frame (src/preview/device.ts: the frame document at the device's width, scaled to the room). -->
<script lang="ts">
  import { Block, Box, Fieldset, Group, Label, Legend, LucideIcon, Radio, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import { mountDevice, type DeviceFrame } from "../../preview/device";
  import { fmt, type DeviceView, type StockText } from "../text";

  let { t, title, devices, device, ondevice, mode, onmode, src }: {
    t: StockText; title: string; devices: readonly DeviceView[]; device: DeviceView; ondevice: (id: string) => void;
    mode: string; onmode: (mode: string) => void; src: string;
  } = $props();
  const ICON = { desktop: "monitor", tablet: "tablet", phone: "smartphone" } as const;
  const MODES = [{ id: "light", icon: "sun" }, { id: "dark", icon: "moon" }] as const;
  const name = $derived(fmt(t.detail.preview.frame, { title }));

  let frame: DeviceFrame | null = null;
  $effect(() => {
    const host = document.getElementById("detail-device");
    if (!host) return;
    frame = mountDevice(host, src, name, device);
    return () => { frame?.destroy(); frame = null; };
  });
  $effect(() => { frame?.size(device); });
  $effect(() => { frame?.name(name); });
</script>

<Block tag="section" aria-labelledby="detail-preview-title" data-testid="detail-preview">
  <Stack gap="4" align="stretch">
    <Group gap="4" align="center" justify="between" class="ui8-detail-preview-bar">
      <Title as={2} size="lg" weight="semibold" id="detail-preview-title">{t.detail.preview.title}</Title>
      <Group gap="4" align="center" class="ui8-detail-preview-controls">
        <Fieldset variant="inline" class="ui8-detail-segments" data-testid="detail-width">
          <Legend class="ui8-detail-legend">{t.detail.preview.width}</Legend>
          {#each devices as d (d.id)}
            <Label class="ui8-detail-segment" title={t.detail.preview.widths[d.id]} data-testid={"width-" + d.width}>
              <Radio class="ui8-detail-segment-input" name="detail-width" value={d.id} checked={d.id === device.id} onchange={() => ondevice(d.id)} />
              <LucideIcon name={ICON[d.id]} size={16} />
              <Text tag="span" class="ui8-detail-segment-text">{t.detail.preview.widths[d.id]}</Text>
            </Label>
          {/each}
        </Fieldset>
        <Fieldset variant="inline" class="ui8-detail-segments" data-testid="detail-mode">
          <Legend class="ui8-detail-legend">{t.detail.preview.mode}</Legend>
          {#each MODES as m (m.id)}
            <Label class="ui8-detail-segment" data-testid={"mode-" + m.id}>
              <Radio class="ui8-detail-segment-input" name="detail-mode" value={m.id} checked={m.id === mode} onchange={() => onmode(m.id)} />
              <LucideIcon name={m.icon} size={16} />
              <Text tag="span">{m.id === "light" ? t.detail.preview.light : t.detail.preview.dark}</Text>
            </Label>
          {/each}
        </Fieldset>
      </Group>
    </Group>
    <Box class="ui8-detail-stage">
      <Box id="detail-device" class="ui8-device" data-device={device.id} data-testid="device-frame"></Box>
    </Box>
  </Stack>
</Block>
