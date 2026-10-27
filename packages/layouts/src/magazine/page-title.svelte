<!-- The heading of a Magazine page (the h1 below its header). -->
<script lang="ts">
  import { Title } from "@codegen-x/svelte-compose";

  let { text, ...rest }: { text: string; [key: `data-${string}`]: string | number | undefined } = $props();
</script>

<Title as={1} weight="bold" class="ui8-page-title" {...rest}>{text}</Title>
