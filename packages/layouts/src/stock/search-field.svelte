<!-- The search field of the header: one form (role search), the field and the submit button laid out by Group. While the field has
     text, a list of suggestions opens under it (the text as typed with its count, the facet values it names with the results each
     gives, the assets it names), each a button: Down moves from the field into the list, Up and Down move along it, Escape goes
     back to the field and closes it. Plain focus moves, so no ARIA state has to follow the keyboard. -->
<script lang="ts">
  import { Box, Button, Form, Group, Input, List, ListItem, LucideIcon, Text } from "@codegen-x/svelte-compose";
  import { fmt, type StockText, type SuggestView } from "./text";

  let { t, q, onsearch, suggest, onpick }: {
    t: StockText; q: string; onsearch: (q: string) => void;
    suggest?: (draft: string) => SuggestView[]; onpick?: (s: SuggestView) => void;
  } = $props();
  let draft = $state("");
  let open = $state(false);
  $effect(() => { draft = q; });
  const items = $derived(open && suggest ? suggest(draft) : []);

  const field = (root: HTMLElement): HTMLInputElement | null => root.querySelector<HTMLInputElement>("[data-testid=search-input]");
  const options = (root: HTMLElement): HTMLElement[] => [...root.querySelectorAll<HTMLElement>("[data-testid=suggest-option]")];

  function pick(s: SuggestView): void {
    open = false;
    if (s.kind === "query") onsearch(s.label);
    else { draft = q; onpick?.(s); }
  }
  function submit(e: SubmitEvent): void {
    e.preventDefault();
    open = false;
    onsearch(draft.trim());
  }
  function key(e: KeyboardEvent): void {
    const root = e.currentTarget as HTMLElement;
    if (e.key === "Escape" && open) { e.preventDefault(); open = false; field(root)?.focus(); return; }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const list = options(root);
    if (!list.length) return;
    e.preventDefault();
    const at = list.indexOf(document.activeElement as HTMLElement);
    if (at < 0) { if (e.key === "ArrowDown") list[0]!.focus(); return; }
    const next = e.key === "ArrowDown" ? at + 1 : at - 1;
    if (next < 0) field(root)?.focus(); else list[Math.min(next, list.length - 1)]!.focus();
  }
  // the list closes when the focus leaves the form (not when it moves from the field into the list)
  function out(e: FocusEvent): void {
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node | null)) open = false;
  }
</script>

<Box class="relative order-last min-w-0 flex-1 basis-full md:order-none md:basis-0" onkeydown={key} onfocusout={out}>
  <Form role="search" onsubmit={submit} data-testid="search-form">
    <Group gap="2" align="center">
      <Input type="search" name="q" value={draft} autocomplete="off" aria-controls="stock-suggest" aria-describedby="stock-suggest-hint"
        oninput={(e: Event) => { draft = (e.currentTarget as HTMLInputElement).value; open = true; }} onfocus={() => (open = true)}
        placeholder={t.search.placeholder} aria-label={t.search.label} data-testid="search-input" />
      <Button type="submit" variant="default" class="size-10 shrink-0 px-0" aria-label={t.search.submit}><LucideIcon name="search" size={16} /></Button>
    </Group>
  </Form>
  <Text tag="span" id="stock-suggest-hint" class="sr-only">{t.search.hint}</Text>
  <Box id="stock-suggest" class={items.length ? "absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded bg-popover text-popover-foreground inset-ring inset-ring-border" : "hidden"}>
    <List tag="ul" aria-label={t.search.suggest} class="max-h-96 overflow-y-auto p-2" data-testid="suggest">
      {#each items as s (s.key)}
        <ListItem>
          <Button variant="ghost" size="sm" class="h-auto w-full justify-start gap-4 px-2 py-2 text-left font-normal focus-visible:bg-accent"
            onclick={() => pick(s)} data-testid="suggest-option" data-kind={s.kind}>
            <LucideIcon name={s.kind === "query" ? "search" : s.kind === "filter" ? "tag" : "layout-grid"} size={16} class="shrink-0 text-muted-foreground" />
            <Text tag="span" class="min-w-0 flex-1 truncate">{s.kind === "query" ? fmt(t.search.searchFor, { q: s.label }) : s.label}</Text>
            {#if s.kind !== "query"}<Text tag="span" class="shrink-0 text-xs text-muted-foreground">{s.group}</Text>{/if}
            {#if s.kind !== "asset"}<Text tag="span" class="w-8 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{fmt(t.search.count, { n: s.count })}</Text>{/if}
          </Button>
        </ListItem>
      {/each}
    </List>
  </Box>
</Box>
