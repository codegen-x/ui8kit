<!-- The header: the name, the search field (text now; the screenshot entry comes later) and the theme switch. -->
<script lang="ts">
  import { Block, Button, Form, Group, Input, LucideIcon, NavActions, Title } from "@codegen-x/svelte-compose";
  import { toggleTheme } from "@ui8kit/app-shared/runtime/theme";
  import { ui } from "../lib/ui";

  let { q = "", onsearch }: { q?: string; onsearch?: (q: string) => void } = $props();
  let draft = $state("");
  $effect(() => { draft = q; });

  function submit(e: SubmitEvent): void {
    e.preventDefault();
    onsearch?.(draft.trim());
  }
</script>

<Block tag="header" class="sticky top-0 z-20 bg-background inset-ring inset-ring-border">
  <Group gap="4" align="center" class="mx-auto w-full max-w-screen-2xl px-4 py-2">
    <Title as={1} size="lg" weight="bold" class="shrink-0">{ui.brand}</Title>
    <Form role="search" class="flex min-w-0 flex-1 gap-2" onsubmit={submit} data-testid="search-form">
      <Input type="search" name="q" value={draft} oninput={(e: Event) => (draft = (e.currentTarget as HTMLInputElement).value)} placeholder={ui.search.placeholder} aria-label={ui.search.label} data-testid="search-input" />
      <Button type="submit" variant="default" layout="icon" aria-label={ui.search.submit}><LucideIcon name="search" size={16} /></Button>
    </Form>
    <NavActions actions="none" themeLabel={ui.theme.toggle} ontheme={() => toggleTheme()} />
  </Group>
</Block>
