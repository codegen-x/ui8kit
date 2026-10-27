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

<Dialog {id} variant="sheet" size="lg" class="ui8-filter-sheet" aria-labelledby={titleId} {onclose} data-testid="filter-sheet">
  {#if ready}
    <Box class="ui8-filter-sheet-head" data-testid="filter-head">
      <Group gap="2" justify="between" align="center">
        <Title as={2} size="base" id={titleId}>{title}</Title>
        <Button variant="ghost" size="sm" onclick={oncancel} data-testid="filter-cancel">{cancelLabel}</Button>
      </Group>
      <Text class="ui8-filter-sheet-note">{note}</Text>
    </Box>
    <Stack gap="0" class="ui8-filter-sheet-body" data-testid="filter-body">{@render children()}</Stack>
    <Group gap="2" class="ui8-filter-sheet-foot" data-testid="filter-foot">
      <Button variant="outline" onclick={onreset} data-testid="filter-reset">{resetLabel}</Button>
      <Button class="ui8-filter-sheet-apply" onclick={onapply} data-testid="filter-update">{applyLabel}</Button>
    </Group>
  {/if}
</Dialog>
