<!-- Airy: a small centred headline, one button, a dot field fading in from one corner; most of the screen is air. -->
<script lang="ts">
  import { Block, Button, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Dots from "../recipes/dots.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Dots v={3} class="absolute inset-0" />
  <TopBar {c} layout="center" action="ghost" mark="circle" />
  <Stack gap="6" align="center" justify="center" class="relative flex-1 text-center">
    <Text size="sm" class="text-muted-foreground">{c.eyebrow}</Text>
    <Title as={1} weight="medium" class="max-w-2xl text-5xl leading-tight tracking-tight">{c.title}</Title>
    <Button size="default" variant="outline" class="mt-4">{c.cta}</Button>
  </Stack>
</Block>
