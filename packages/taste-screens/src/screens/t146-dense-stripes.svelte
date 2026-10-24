<!-- Fintech landing, lower: three price plans (the middle one dark), a frequently-asked-questions column with kit disclosures, and a row of testimonial strips. -->
<script lang="ts">
  import { Block, Box, Button, Card, Disclosure, Grid, Group, LucideIcon, Stack, Summary, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import Avatars from "../parts/avatars.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col gap-6 px-16 py-8">
  <Group justify="between" class="items-end"><Title as={1} weight="bold" class="max-w-xl text-4xl tracking-tight">{c.accent}</Title><Text size="sm" class="max-w-xs text-muted-foreground">{c.lead}</Text></Group>
  <Grid cols="3" class="gap-4">
    {#each c.plans ?? [] as p, i (p.name)}
      <Card class={"gap-4 p-6 " + (i === 1 ? "bg-foreground text-background inset-ring-foreground" : "")}>
        <Text weight="semibold">{p.name}</Text>
        <Text class="text-4xl font-bold">{p.price}</Text>
        <Stack gap="2">{#each p.perks as k (k)}<Group gap="2"><LucideIcon name="check" size={16} /><Text size="sm">{k}</Text></Group>{/each}</Stack>
        <Button variant={i === 1 ? "secondary" : "default"} class="w-full">{c.cta}</Button>
      </Card>
    {/each}
  </Grid>
  <Grid cols="2" class="flex-1 gap-8">
    <Stack gap="4"><Title as={2} weight="semibold" class="text-3xl">{c.eyebrow}</Title>
      <Box class="rounded bg-card inset-ring inset-ring-border">{#each c.faq ?? [] as q, i (q.title)}<Disclosure variant="item" open={i === 0} class="px-4"><Summary class="py-2"><Text size="sm" weight="medium">{q.title}</Text></Summary><Text size="sm" class="pb-2 text-muted-foreground">{q.text}</Text></Disclosure>{/each}</Box>
    </Stack>
    <Stack gap="2" justify="center">
      {#each c.quotes ?? [] as q (q.name)}<Card variant="muted" class="flex-row items-center gap-4 p-4"><Avatars n={1} size={48} /><Stack gap="0"><Text size="sm">{q.text}</Text><Text size="xs" class="text-muted-foreground">{q.name}, {q.role}</Text></Stack></Card>{/each}
    </Stack>
  </Grid>
</Block>
