<!-- The full-screen preview: a modal dialog (the kit Dialog, native: Esc and Close end it, focus stays inside) with the device width
     (desktop, tablet, phone) and the light/dark mode as two radio groups styled as segments, over the device frame fitted to the
     room both ways; or `side`: desktop and phone side by side (Landbook-style), each fitted to its own cell. Open while `device`
     is set; the app keeps it in the URL and `onclose` asks to drop it. -->
<script lang="ts">
  import { Box, Button, Dialog, Fieldset, Group, Label, Legend, LucideIcon, Radio, Text, Title } from "@codegen-x/svelte-compose";
  import { mountDevice, type DeviceFrame } from "../../preview/device";
  import { fmt, type DeviceView, type StockText } from "../text";

  let { t, title, devices, device, side = false, ondevice, mode, onmode, src, onclose }: {
    t: StockText; title: string; devices: readonly DeviceView[]; device: DeviceView | null; side?: boolean; ondevice: (id: string) => void;
    mode: string; onmode: (mode: string) => void; src: string; onclose: () => void;
  } = $props();
  const ICON = { desktop: "monitor", tablet: "tablet", phone: "smartphone" } as const;
  const MODES = [{ id: "light", icon: "sun" }, { id: "dark", icon: "moon" }] as const;
  const name = $derived(fmt(t.detail.preview.frame, { title }));
  const open = $derived(device !== null);

  // no reactive attributes on the Dialog itself (a re-spread writes `open` again): opened and closed here, found by id
  $effect(() => {
    const dialog = document.getElementById("detail-full") as HTMLDialogElement | null;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  });
  const desktop = $derived(devices.find((d) => d.id === "desktop") ?? devices[0]!);
  const phone = $derived(devices.find((d) => d.id === "phone") ?? devices[devices.length - 1]!);
  let frame: DeviceFrame | null = null;
  $effect(() => {
    if (!open) return;
    const both = side;
    const host = document.getElementById("detail-full-device");
    if (!host) return;
    frame = mountDevice(host, src, name, both ? desktop : device!, "contain");
    const second = both ? document.getElementById("detail-full-phone") : null;
    const other = second ? mountDevice(second, src, name, phone, "contain") : null;
    return () => { frame?.destroy(); frame = null; other?.destroy(); };
  });
  $effect(() => { if (device && !side) frame?.size(device); });
</script>

<Dialog id="detail-full" size="full" variant="sheet" class="ui8-full" aria-labelledby="detail-full-title" {onclose} data-testid="detail-fullscreen">
  {#if device}
    <Group gap="4" align="center" justify="between" class="ui8-full-bar">
      <Title as={2} size="base" weight="semibold" id="detail-full-title" class="ui8-full-title">{fmt(t.detail.preview.fullTitle, { title })}</Title>
      <Group gap="4" align="center" class="ui8-full-controls">
        <Fieldset variant="inline" class="ui8-detail-segments" data-testid="detail-width">
          <Legend class="ui8-detail-legend">{t.detail.preview.width}</Legend>
          {#each devices as d (d.id)}
            <Label class="ui8-detail-segment" title={t.detail.preview.widths[d.id]} data-testid={"width-" + d.width}>
              <Radio class="ui8-detail-segment-input" name="detail-width" value={d.id} checked={!side && d.id === device.id} onchange={() => ondevice(d.id)} />
              <LucideIcon name={ICON[d.id]} size={16} />
              <Text tag="span" class="ui8-detail-segment-text">{t.detail.preview.widths[d.id]}</Text>
            </Label>
          {/each}
          <Label class="ui8-detail-segment" title={t.detail.preview.side} data-testid="width-side">
            <Radio class="ui8-detail-segment-input" name="detail-width" value="side" checked={side} onchange={() => ondevice("side")} />
            <LucideIcon name="monitor-smartphone" size={16} />
            <Text tag="span" class="ui8-detail-segment-text">{t.detail.preview.side}</Text>
          </Label>
        </Fieldset>
        <Fieldset variant="inline" class="ui8-detail-segments" data-testid="detail-mode">
          <Legend class="ui8-detail-legend">{t.detail.preview.mode}</Legend>
          {#each MODES as m (m.id)}
            <Label class="ui8-detail-segment" data-testid={"mode-" + m.id}>
              <Radio class="ui8-detail-segment-input" name="detail-mode" value={m.id} checked={m.id === mode} onchange={() => onmode(m.id)} />
              <LucideIcon name={m.icon} size={16} />
              <Text tag="span" class="ui8-detail-segment-text">{m.id === "light" ? t.detail.preview.light : t.detail.preview.dark}</Text>
            </Label>
          {/each}
        </Fieldset>
        <Button variant="outline" size="sm" onclick={onclose} data-testid="detail-full-close">
          <LucideIcon name="x" size={16} />
          <Text tag="span">{t.detail.preview.close}</Text>
        </Button>
      </Group>
    </Group>
    {#if side}
      <Box class="ui8-full-side" data-testid="full-side">
        <Box class="ui8-full-cell ui8-full-wide">
          <Box id="detail-full-device" class="ui8-device" data-device="desktop" data-testid="full-device-frame"></Box>
        </Box>
        <Box class="ui8-full-cell">
          <Box id="detail-full-phone" class="ui8-device" data-device="phone" data-testid="full-phone-frame"></Box>
        </Box>
      </Box>
    {:else}
      <Box class="ui8-full-room">
        <Box id="detail-full-device" class="ui8-device" data-device={device.id} data-testid="full-device-frame"></Box>
      </Box>
    {/if}
  {/if}
</Dialog>
