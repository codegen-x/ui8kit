<!-- Export and import of the whole global theme: one JSON config with every field (@ui8kit/theme-model/global-theme toConfig /
     fromConfig through the app's controller). Used by both panels of the Theme sheet (and the Magazine's style page). -->
<script lang="ts">
  import { Button, Group, Label, LucideIcon, Stack, Text, Textarea, Title } from "@codegen-x/svelte-compose";
  import type { ThemeController } from "@ui8kit/theme-model/controller";
  import type { ThemeIoText } from "./text";

  let { ctl, text, idp }: { ctl: Pick<ThemeController, "exportConfig" | "importConfig">; text: ThemeIoText; /** id prefix: unique per use on a page */ idp: string } = $props();
  type Status = "" | "copied" | "copyFailed" | "imported" | "partial" | "invalid";
  let value = $state("");
  let status = $state<Status>("");
  let detail = $state("");
  const message = $derived(status ? text[status] + (detail ? ": " + detail : "") : "");

  async function copy(): Promise<void> {
    value = JSON.stringify(ctl.exportConfig(), null, 2);
    detail = "";
    try { await navigator.clipboard.writeText(value); status = "copied"; } catch { status = "copyFailed"; }
  }
  function load(): void {
    const r = ctl.importConfig(value);
    if (r.ok) { status = r.dropped.length ? "partial" : "imported"; detail = r.dropped.join(", "); } else { status = "invalid"; detail = r.error; }
  }
</script>

<Stack gap="2" class="ui8-theme-io" data-testid={idp + "-io"}>
  <Title as={3} size="sm" class="ui8-theme-io-title">{text.title}</Title>
  <Text class="ui8-theme-io-note">{text.note}</Text>
  <Label for={idp + "-io-text"}><Text tag="span" weight="semibold">{text.label}</Text></Label>
  <Textarea id={idp + "-io-text"} rows={8} class="ui8-theme-io-text" {value} placeholder={text.placeholder} oninput={(e: Event) => (value = (e.currentTarget as HTMLTextAreaElement).value)} data-testid={idp + "-io-text"} />
  <Group gap="2">
    <Button variant="outline" size="sm" class="ui8-theme-io-action" onclick={copy} data-testid={idp + "-export"}><LucideIcon name="copy" size={16} />{text.export}</Button>
    <Button size="sm" class="ui8-theme-io-action" disabled={!value.trim()} onclick={load} data-testid={idp + "-import"}><LucideIcon name="upload" size={16} />{text.import}</Button>
  </Group>
  <Text class="ui8-theme-io-note" role="status" data-testid={idp + "-io-status"}>{message}</Text>
</Stack>
