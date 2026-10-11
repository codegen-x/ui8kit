<!-- Fintech landing, top: a centred headline with two actions, a wide dotted hero plate carrying a wallet card, a ribbon of company names and three feature cards. -->
<script lang="ts">
  import { Block, Box, Button, Card, Grid, Group, LogoRibbon, LucideIcon, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { logos } from "../kit-data";
  import Avatars from "../parts/avatars.svelte";
  import TopBar from "../parts/top-bar.svelte";
  import Dots from "../recipes/dots.svelte";

  let { c }: { c: Deck } = $props();
  const icons = ["zap", "users", "globe"];
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="default" />
  <Stack gap="4" align="center" class="px-16 pt-4 text-center">
    <Text size="xs" class="rounded bg-muted px-4 py-2 text-muted-foreground">{c.eyebrow}</Text>
    <Title as={1} weight="bold" class="max-w-3xl text-5xl leading-tight tracking-tight">{c.title}</Title>
    <Group gap="4"><Button size="lg">{c.cta}</Button><Button size="lg" variant="outline">{c.secondary}</Button></Group>
  </Stack>
  <Box class="relative mx-16 my-6 h-64 overflow-hidden rounded">
    <Dots v={1} class="absolute inset-0" />
    <Card class="absolute top-6 left-1/2 w-96 -translate-x-1/2 gap-2 p-4 shadow-lg"><Group justify="between"><Text size="sm" weight="semibold">{c.brand}</Text><Avatars n={2} size={24} /></Group><Text class="text-3xl font-bold">$20,000.00</Text><Text size="xs" class="text-muted-foreground">{c.stats[1]!.value} {c.stats[1]!.label}</Text></Card>
  </Box>
  <Box class="px-16"><LogoRibbon id="trusted" title={c.accent} logos={logos(c, 6)} /></Box>
  <Grid cols="3" class="flex-1 gap-4 px-16 py-6">
    {#each c.items.slice(0, 3) as it, i (it.title)}
      <Card class={"gap-2 p-6 " + (i === 1 ? "bg-primary text-primary-foreground inset-ring-primary" : "")}><LucideIcon name={icons[i]!} size={24} /><Text weight="semibold">{it.title}</Text><Text size="sm" class={i === 1 ? "" : "text-muted-foreground"}>{it.text}</Text></Card>
    {/each}
  </Grid>
</Block>
