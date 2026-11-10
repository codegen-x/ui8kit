<!-- The Collections page: the way back, the collection picker (switch, name, new, delete), the hand-off (Open in BuildY, Export
     JSON, a polite status line) and the items of the active collection in their order, each with its live preview (a snippet of
     the app), what it is, a note for BuildY and the moves (up, down, remove). An item the current catalog does not have says so. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { Badge, Block, Button, Card, Group, Input, Label, Link, List, ListItem, LucideIcon, Select, SelectOption, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import { fmt, type KeptView, type Option, type StockText } from "./text";

  let { t, back, collections, active, name, items, thumb, openHref, status = "", onpick, onrename, oncreate, ondelete, onopen, onexport, onmove, ondrop, onnote }: {
    t: StockText; back: string;
    /** every collection of this device, `active` the one shown, `name` its title */
    collections: Option[]; active: string; name: string;
    items: KeptView[]; thumb: Snippet<[KeptView]>;
    /** the Open in BuildY link; empty: too long for a link (the button downloads the file instead, `onopen`) */
    openHref: string; status?: string;
    onpick: (id: string) => void; onrename: (title: string) => void; oncreate: () => void; ondelete: () => void;
    onopen: () => void; onexport: () => void; onmove: (key: string, by: -1 | 1) => void; ondrop: (key: string) => void; onnote: (key: string, note: string) => void;
  } = $props();
  const slug = (key: string): string => key.replace(/[^a-z0-9]+/gi, "-");
</script>

<Block tag="main" id="main-content" aria-labelledby="collection-page-title" class="mx-auto w-full max-w-screen-2xl px-4 pt-8 pb-16" data-slot="collection-page" data-testid="collection-page">
  <Stack gap="6" align="stretch">
    <Link href={back} size="sm" variant="muted" class="self-start" data-testid="collection-back">{t.collection.back}</Link>
    <Group gap="4" align="end" justify="between" class="flex-wrap">
      <Stack gap="2" align="start">
        <Title as={1} size="2xl" weight="bold" id="collection-page-title">{t.collection.title}</Title>
        <Text tag="p" size="sm" class="text-muted-foreground" data-testid="collection-count">{fmt(t.collection.count, { n: items.length })}</Text>
      </Stack>
      <Group gap="2" align="end" class="flex-wrap" role="group" aria-label={t.collection.actions}>
        <Stack gap="2" align="stretch">
          <Label for="collection-pick" class="text-xs text-muted-foreground">{t.collection.pick}</Label>
          <Select id="collection-pick" size="sm" class="w-48" value={active} onchange={(e: Event) => onpick((e.currentTarget as HTMLSelectElement).value)} data-testid="collection-pick">
            {#each collections as c (c.id)}<SelectOption value={c.id}>{c.label}</SelectOption>{/each}
          </Select>
        </Stack>
        <Stack gap="2" align="stretch">
          <Label for="collection-name" class="text-xs text-muted-foreground">{t.collection.name}</Label>
          <Input id="collection-name" size="sm" class="w-48" value={name} maxlength={160} onchange={(e: Event) => onrename((e.currentTarget as HTMLInputElement).value)} data-testid="collection-name" />
        </Stack>
        <Button variant="outline" size="sm" class="gap-2" onclick={oncreate} data-testid="collection-create"><LucideIcon name="plus" size={16} /><Text tag="span">{t.collection.create}</Text></Button>
        <Button variant="ghost" size="sm" class="gap-2" onclick={ondelete} data-testid="collection-delete"><LucideIcon name="trash" size={16} /><Text tag="span">{t.collection.remove}</Text></Button>
      </Group>
    </Group>

    <Stack gap="2" align="stretch" class="rounded border border-border p-4">
      <Group gap="2" align="center" class="flex-wrap">
        {#if openHref && items.length > 0}
          <Button href={openHref} target="_blank" rel="noopener" variant="default" size="sm" class="gap-2" onclick={onopen} data-testid="collection-open"><LucideIcon name="external-link" size={16} /><Text tag="span">{t.collection.open}</Text></Button>
        {:else}
          <Button variant="default" size="sm" class="gap-2" disabled={items.length === 0} onclick={onopen} data-testid="collection-open"><LucideIcon name="download" size={16} /><Text tag="span">{t.collection.open}</Text></Button>
        {/if}
        <Button variant="outline" size="sm" class="gap-2" disabled={items.length === 0} onclick={onexport} data-testid="collection-export"><LucideIcon name="file-down" size={16} /><Text tag="span">{t.collection.export}</Text></Button>
        <Text tag="p" size="sm" role="status" class="text-muted-foreground" data-testid="collection-status">{status}</Text>
      </Group>
      <Text tag="p" size="sm" class="text-muted-foreground">{t.collection.openHint}</Text>
    </Stack>

    {#if items.length === 0}
      <Text tag="p" class="text-muted-foreground" data-testid="collection-empty">{t.collection.empty}</Text>
    {:else}
      <List tag="ol" aria-label={t.collection.items} class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" data-testid="collection-items">
        {#each items as it, i (it.key)}
          <ListItem class="min-w-0" data-slot="collection-item" data-asset={it.key}>
            <Card class="h-full gap-0 overflow-hidden border border-border p-0 inset-ring-0">
              {@render thumb(it)}
              <Stack gap="2" align="stretch" class="p-4">
                <Group gap="2" align="center" justify="between">
                  <Title as={2} size="sm" class="min-w-0 truncate">
                    {#if it.href}<Link href={it.href} size="sm" class="block truncate">{it.title}</Link>{:else}<Text tag="span">{it.title}</Text>{/if}
                  </Title>
                  <Badge size="sm" variant="secondary">{it.kind}</Badge>
                </Group>
                <Text tag="p" size="sm" class="truncate text-muted-foreground">{it.variant}</Text>
                {#if !it.href}<Text tag="p" size="sm" class="text-destructive" data-testid="collection-missing">{t.collection.missing}</Text>{/if}
                <Label for={"note-" + slug(it.key)} class="text-xs text-muted-foreground">{t.collection.note}</Label>
                <Input id={"note-" + slug(it.key)} size="sm" value={it.note} maxlength={500} placeholder={t.collection.notePlaceholder} onchange={(e: Event) => onnote(it.key, (e.currentTarget as HTMLInputElement).value)} data-testid="collection-note" />
                <Group gap="2" align="center" justify="end">
                  <Button variant="ghost" size="sm" class="size-8 p-0" disabled={i === 0} aria-label={t.collection.up + ": " + it.title} title={t.collection.up} onclick={() => onmove(it.key, -1)} data-testid="collection-up"><LucideIcon name="arrow-up" size={16} /></Button>
                  <Button variant="ghost" size="sm" class="size-8 p-0" disabled={i === items.length - 1} aria-label={t.collection.down + ": " + it.title} title={t.collection.down} onclick={() => onmove(it.key, 1)} data-testid="collection-down"><LucideIcon name="arrow-down" size={16} /></Button>
                  <Button variant="ghost" size="sm" class="size-8 p-0" aria-label={t.collection.drop + ": " + it.title} title={t.collection.drop} onclick={() => ondrop(it.key)} data-testid="collection-drop"><LucideIcon name="x" size={16} /></Button>
                </Group>
              </Stack>
            </Card>
          </ListItem>
        {/each}
      </List>
    {/if}
  </Stack>
</Block>
