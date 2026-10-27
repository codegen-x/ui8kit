<!-- The live render of a preview: the organisms of its parts, by name, from the svelte-compose barrel, with resolved props. A
     card-sized block is centred in a narrow column as on the screens. -->
<script lang="ts">
  import * as kit from "@codegen-x/svelte-compose";
  import { Box } from "@codegen-x/svelte-compose";
  import type { Component } from "svelte";
  import { resolveProps, type Ctx, type Part } from "./recipe";

  let { parts, ctx }: { parts: Part[]; ctx: Ctx } = $props();
  const lib = kit as unknown as Record<string, Component<Record<string, unknown>> | undefined>;
  const items = $derived(parts.map((p) => ({ p, View: lib[p.organism], props: resolveProps(p, ctx) })));
</script>

{#each items as it (it.p.key)}
  {#if it.View}
    {#if it.p.fit === "card"}
      <Box class="mx-auto w-full max-w-sm px-4 py-8"><it.View {...it.props} /></Box>
    {:else}
      <it.View {...it.props} />
    {/if}
  {/if}
{/each}
