<!-- Editorial newspaper: a rule-framed masthead line, a headline across, then three text columns with a striped plate in one. -->
<script lang="ts">
  import { Block, Grid, Group, Inline, Separator, Stack, Text, Title, Button } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import Stripes from "../recipes/stripes.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col px-16 py-10">
  <Group justify="between" class="pb-4"><Text size="sm">{c.nav[0]} · {c.nav[1]}</Text><Inline class="text-4xl font-black tracking-tight">{c.brand}</Inline><Text size="sm">{c.eyebrow}</Text></Group>
  <Separator class="h-1 bg-foreground" />
  <Title as={1} weight="bold" class="font-black py-10 text-center text-8xl leading-none tracking-tight">{c.title}</Title>
  <Separator />
  <Grid cols="3" class="flex-1 gap-10 pt-8">
    <Stack gap="4"><Text size="xl" weight="semibold">{c.accent}</Text><Text class="text-muted-foreground">{c.lead}</Text><Text class="text-muted-foreground">{c.items[0]!.text}</Text><Button variant="link" class="self-start px-0">{c.cta}</Button></Stack>
    <Stack gap="4" align="stretch"><Stripes v={2} class="h-80 rounded" /><Text size="sm" class="text-muted-foreground">{c.note}</Text></Stack>
    <Stack gap="6">{#each c.items as it (it.title)}<Stack gap="2"><Text weight="bold">{it.title}</Text><Text size="sm" class="text-muted-foreground">{it.text}</Text></Stack>{/each}</Stack>
  </Grid>
</Block>
