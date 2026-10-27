<!-- A modal side sheet of settings (the kit Dialog, variant sheet): a head (title, Cancel, a note), a scrolling body (the groups, as
     children) and a foot (Reset, and the primary action filling the row). The app opens and closes the native dialog by its id and
     renders the content only while it has a draft (`ready`). -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { Box, Button, Dialog, Group, Stack, Text, Title } from "@codegen-x/svelte-compose";

  let { id, title, note, cancelLabel, resetLabel, applyLabel, ready, oncancel, onreset, onapply, onclose, children }: {
    id: string; title: string; note: string; cancelLabel: string; resetLabel: string; applyLabel: string; ready: boolean;
    oncancel: () => void; onreset: () => void; onapply: () => void; onclose: () => void; children: Snippet;
  } = $props();
  const titleId = $derived(id + "-title");
</script>

<Dialog {id} variant="sheet" size="lg" class="my-0 mr-0 ml-auto h-dvh max-h-dvh w-full max-w-120 overflow-hidden p-0 text-sm not-open:hidden open:flex open:flex-col" aria-labelledby={titleId} {onclose} data-testid="filter-sheet">
  {#if ready}
    <Box class="flex-none border-b border-border bg-background px-6 py-4" data-testid="filter-head">
      <Group gap="2" justify="between" align="center">
        <Title as={2} size="base" id={titleId}>{title}</Title>
        <Button variant="ghost" size="sm" onclick={oncancel} data-testid="filter-cancel">{cancelLabel}</Button>
      </Group>
      <Text class="mt-2 text-sm text-muted-foreground">{note}</Text>
    </Box>
    <Stack gap="0" class="min-h-0 flex-auto scroll-py-6 overflow-y-auto overscroll-contain px-6" data-testid="filter-body">{@render children()}</Stack>
    <Group gap="2" class="flex-none border-t border-border bg-background px-6 py-4" data-testid="filter-foot">
      <Button variant="outline" onclick={onreset} data-testid="filter-reset">{resetLabel}</Button>
      <Button class="flex-1" onclick={onapply} data-testid="filter-update">{applyLabel}</Button>
    </Group>
  {/if}
</Dialog>
