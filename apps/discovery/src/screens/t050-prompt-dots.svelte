<!-- Prompt as a sign-up: dots across the end half, the headline and an email row with a consent checkbox at the start. -->
<script lang="ts">
  import { Block, Button, Checkbox, Group, Input, Label, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import TopBar from "../parts/top-bar.svelte";
  import Dots from "../recipes/dots.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Dots v={1} class="absolute inset-y-0 right-0 w-1/2" />
  <TopBar {c} layout="start" action="outline" />
  <Stack gap="8" justify="center" class="relative flex-1 px-16">
    <Title as={1} weight="bold" class="max-w-3xl text-8xl leading-none tracking-tight">{c.title}</Title>
    <Text size="xl" class="max-w-xl text-muted-foreground">{c.lead}</Text>
    <Group gap="2" class="w-[560px]"><Input size="lg" placeholder={c.input} /><Button size="lg">{c.cta}</Button></Group>
    <Group gap="2"><Checkbox id="consent" checked /><Label for="consent" class="text-muted-foreground">{c.note}</Label></Group>
  </Stack>
</Block>
