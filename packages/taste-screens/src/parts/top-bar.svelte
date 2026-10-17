<!--
  The top bar of a taste screen: a wordmark (a small mark plus a generic word), menu words (no links: a showcase
  has no routes) and one action.
  Layouts: split (links in the middle), start (links after the wordmark), center (wordmark in the middle), bare (wordmark
  and the action only). `tone="inverse"` sets it on a dark or coloured field.
-->
<script lang="ts">
  import { Block, Button, Box, Group, Inline } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";

  let { c, layout = "split", tone = "default", action = "default", mark = "square" }: {
    c: Deck;
    layout?: "split" | "start" | "center" | "bare";
    tone?: "default" | "inverse";
    action?: "default" | "outline" | "secondary" | "ghost";
    mark?: "square" | "circle" | "bar" | "none";
  } = $props();

  const ink = $derived(tone === "inverse" ? "text-background" : "text-foreground");
  const markStyle = $derived(
    mark === "circle" ? "width:24px;height:24px;border-radius:50%" : mark === "bar" ? "width:8px;height:24px" : "width:24px;height:24px"
  );
</script>

<Block tag="header" class={"relative z-10 flex h-20 w-full items-center px-16 " + (layout === "center" ? "justify-center" : "justify-between")}>
  {#if layout === "center"}
    <Group gap="8" class={"absolute left-16 " + ink}>
      {#each c.nav.slice(0, 2) as n (n)}
        <Inline class={"text-sm font-medium " + ink}>{n}</Inline>
      {/each}
    </Group>
  {/if}
  <Group gap="2" class={ink}>
    {#if mark !== "none"}
      <Box class={tone === "inverse" ? "bg-background" : "bg-primary"} style={markStyle} />
    {/if}
    <Inline class="text-lg font-bold tracking-tight">{c.brand}</Inline>
  </Group>
  {#if layout === "split" || layout === "start"}
    <Group gap="8" class={layout === "start" ? "mr-auto ml-12" : ""}>
      {#each c.nav as n (n)}
        <Inline class={"text-sm font-medium " + (tone === "inverse" ? "text-background/80" : "text-muted-foreground")}>{n}</Inline>
      {/each}
    </Group>
  {/if}
  {#if layout === "center"}
    <Box class="absolute right-16">
      <Button size="sm" variant={action}>{c.cta}</Button>
    </Box>
  {:else}
    <Button size="sm" variant={action}>{c.cta}</Button>
  {/if}
</Block>
