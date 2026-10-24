<!-- Prompt as a sign-up: striped bands top and bottom, a centred headline and a large email field with the action. -->
<script lang="ts">
  import { Block, Button, Group, Stack, Text, Title, Input } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Stripes from "../recipes/stripes.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="center" action="default" />
  <Stripes v={1} class="h-24" />
  <Stack gap="8" align="center" justify="center" class="flex-1 px-16 text-center">
    <Text size="sm" weight="semibold" class="tracking-widest text-primary uppercase">{c.eyebrow}</Text>
    <Title as={1} weight="bold" class="max-w-4xl text-8xl leading-none tracking-tight">{c.title}</Title>
    <Text size="xl" class="max-w-2xl text-muted-foreground">{c.lead}</Text>
    <Group gap="2" class="w-full max-w-xl"><Input size="lg" placeholder={c.input} /><Button size="lg">{c.cta}</Button></Group>
    <Text size="sm" class="text-muted-foreground">{c.note}</Text>
  </Stack>
  <Stripes v={5} class="h-24" />
</Block>
