<!-- The taste bar: the profile the feed is built from (derived from the picks, or tuned), the Filters button and Reset. -->
<script lang="ts">
  import { Block, Box, Button, Group, Text } from "@codegen-x/svelte-compose";
  import ui from "../../content/ui.json";
  import { isDerived, type Tune } from "../lib/feed";
  import { resetTune, tuning } from "../lib/tune.svelte";
  import { axisLine } from "./labels";

  const AXES: Array<keyof Tune> = ["comp", "character", "density", "skins", "font", "radius", "task", "media"];
  const tune = $derived(tuning.tune!);
  const tuned = $derived(!isDerived(tune, tuning.base!));
</script>

<Block tag="section" class="mg-taste" data-testid="taste-bar" data-tuned={tuned ? "1" : "0"} aria-label={ui.feed.profile}>
  <Group gap="2" class="mg-taste-head">
    <Text tag="span" weight="semibold">{ui.feed.profile}</Text>
    {#if tuned}<Text tag="span" class="mg-eyebrow">{ui.feed.tuned}</Text>{/if}
    <Box class="mg-spacer" />
    <Button size="sm" onclick={() => (tuning.sheet = true)} data-testid="taste-filters">{ui.feed.filters}</Button>
    <Button size="sm" variant="outline" disabled={!tuned} onclick={resetTune} data-testid="taste-reset">{ui.feed.reset}</Button>
  </Group>
  <Box tag="dl" class="mg-taste-list">
    {#each AXES as axis (axis)}
      <Box class="mg-taste-item">
        <Text tag="dt">{ui.feed.axes[axis]}</Text>
        <Text tag="dd">{axisLine(tune, axis)}</Text>
      </Box>
    {/each}
  </Box>
</Block>
