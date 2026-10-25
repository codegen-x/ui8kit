<!-- Export and import of the whole global theme: one JSON config with every field (lib/global-theme.ts toConfig / fromConfig, format
     magazine-theme v2; a style preset from "Copy preset" imports too). Used by both panels of the Theme sheet and the style page's
     Design system tab: the same config everywhere. -->
<script lang="ts">
  import { Button, Group, Label, LucideIcon, Stack, Text, Textarea, Title } from "@codegen-x/svelte-compose";
  import ui from "../../content/ui.json";
  import { exportConfig, importConfig } from "../lib/global-theme.svelte";

  let { idp }: { /** id prefix: unique per use on a page */ idp: string } = $props();
  const T = ui.theme.io;
  type Status = "" | "copied" | "copyFailed" | "imported" | "partial" | "invalid";
  let text = $state("");
  let status = $state<Status>("");
  let detail = $state("");
  const message = $derived(status ? (T as Record<string, string>)[status] + (detail ? ": " + detail : "") : "");

  async function copy(): Promise<void> {
    text = JSON.stringify(exportConfig(), null, 2);
    detail = "";
    try { await navigator.clipboard.writeText(text); status = "copied"; } catch { status = "copyFailed"; }
  }
  function load(): void {
    const r = importConfig(text);
    if (r.ok) { status = r.dropped.length ? "partial" : "imported"; detail = r.dropped.join(", "); } else { status = "invalid"; detail = r.error; }
  }
</script>

<Stack gap="2" class="mg-tio" data-testid={idp + "-io"}>
  <Title as={3} class="mg-h3">{T.title}</Title>
  <Text class="mg-note">{T.note}</Text>
  <Label for={idp + "-io-text"}><Text tag="span" weight="semibold">{T.label}</Text></Label>
  <Textarea id={idp + "-io-text"} rows={8} class="mg-tio-text" value={text} placeholder={T.placeholder} oninput={(e: Event) => (text = (e.currentTarget as HTMLTextAreaElement).value)} data-testid={idp + "-io-text"} />
  <Group gap="2">
    <Button variant="outline" size="sm" onclick={copy} data-testid={idp + "-export"}><LucideIcon name="copy" size={16} />{T.export}</Button>
    <Button size="sm" disabled={!text.trim()} onclick={load} data-testid={idp + "-import"}><LucideIcon name="upload" size={16} />{T.import}</Button>
  </Group>
  <Text class="mg-note" role="status" data-testid={idp + "-io-status"}>{message}</Text>
</Stack>
