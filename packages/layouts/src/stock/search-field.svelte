<!-- The search field of the header: one form (role search), the field and the submit button laid out by Group. -->
<script lang="ts">
  import { Button, Form, Group, Input, LucideIcon } from "@codegen-x/svelte-compose";
  import type { StockText } from "./text";

  let { t, q, onsearch }: { t: StockText; q: string; onsearch: (q: string) => void } = $props();
  let draft = $state("");
  $effect(() => { draft = q; });

  function submit(e: SubmitEvent): void {
    e.preventDefault();
    onsearch(draft.trim());
  }
</script>

<Form role="search" class="order-last min-w-0 flex-1 basis-full md:order-none md:basis-0" onsubmit={submit} data-testid="search-form">
  <Group gap="2" align="center">
    <Input type="search" name="q" value={draft} oninput={(e: Event) => (draft = (e.currentTarget as HTMLInputElement).value)} placeholder={t.search.placeholder} aria-label={t.search.label} data-testid="search-input" />
    <Button type="submit" variant="default" class="size-10 px-0" aria-label={t.search.submit}><LucideIcon name="search" size={16} /></Button>
  </Group>
</Form>
