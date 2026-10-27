<!-- The Theme sheet: the settings of the previews and the site (mode, skin, font, radius, density) as a modal side sheet. The model
     lives in the app; this only renders its fields and reports changes. -->
<script lang="ts">
  import { Button, Dialog, Fieldset, Group, Label, Legend, LucideIcon, Radio, Select, SelectOption, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { StockText, ThemeField } from "./text";

  let { t, open, fields, onchange, onreset, onclose }: {
    t: StockText; open: boolean; fields: ThemeField[];
    onchange: (id: string, value: string) => void; onreset: () => void; onclose: () => void;
  } = $props();
  const ID = "stock-theme";
  $effect(() => {
    const d = document.getElementById(ID) as HTMLDialogElement | null;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  });
</script>

<Dialog id={ID} variant="sheet" size="lg" class="mr-0 max-w-full" aria-labelledby="stock-theme-title" onclose={onclose} data-testid="theme-sheet">
  <Stack gap="6" align="stretch" class="p-6">
    <Group gap="4" align="center" justify="between">
      <Title as={2} size="lg" id="stock-theme-title">{t.theme.title}</Title>
      <Button variant="ghost" size="sm" class="size-8 px-0" aria-label={t.theme.close} onclick={onclose} data-testid="theme-close"><LucideIcon name="x" size={16} /></Button>
    </Group>
    <Text tag="p" size="sm" class="text-muted-foreground">{t.theme.note}</Text>
    {#each fields as f (f.id)}
      {#if f.control === "radio"}
        <Fieldset>
          <Legend>{f.label}</Legend>
          <Group gap="4" align="center" class="flex-wrap">
            {#each f.options as o (o.id)}
              <Label class="inline-flex cursor-pointer items-center gap-2 text-sm">
                <Radio name={"theme-" + f.id} value={o.id} checked={o.id === f.value} onchange={() => onchange(f.id, o.id)} data-testid={"theme-" + f.id + "-" + (o.id || "unset")} />
                <Text tag="span">{o.label}</Text>
              </Label>
            {/each}
          </Group>
        </Fieldset>
      {:else}
        <Stack gap="2" align="stretch">
          <Label for={"theme-" + f.id} class="text-sm font-bold">{f.label}</Label>
          <Select id={"theme-" + f.id} value={f.value} onchange={(e: Event) => onchange(f.id, (e.currentTarget as HTMLSelectElement).value)} data-testid={"theme-" + f.id}>
            {#each f.options as o (o.id)}<SelectOption value={o.id}>{o.label}</SelectOption>{/each}
          </Select>
        </Stack>
      {/if}
    {/each}
    <Button variant="outline" size="sm" class="self-start" onclick={onreset} data-testid="theme-reset">{t.theme.reset}</Button>
  </Stack>
</Dialog>
